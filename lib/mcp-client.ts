import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
  published_date?: string;
}

export interface BraveSearchResponse {
  web?: {
    results: SearchResult[];
    total_count?: number;
  };
  query: string;
}

export class BraveMCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

  private parseTextSearchResults(text: string): SearchResult[] {
    const results: SearchResult[] = [];

    // Split by double newlines to separate entries
    const entries = text.split('\n\n').filter(entry => entry.trim());

    for (const entry of entries) {
      const lines = entry.split('\n').filter(line => line.trim());
      let title = '';
      let url = '';
      let snippet = '';

      for (const line of lines) {
        if (line.startsWith('Title: ')) {
          title = line.substring(7).trim();
        } else if (line.startsWith('URL: ')) {
          url = line.substring(5).trim();
        } else if (line.startsWith('Description: ')) {
          snippet = line.substring(13).trim()
            // Remove HTML tags and entities
            .replace(/<[^>]*>/g, '')
            .replace(/&[^;]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      }

      if (title && url) {
        results.push({
          title,
          url,
          snippet: snippet || 'No description available',
        });
      }
    }

    return results;
  }

  async connect(): Promise<void> {
    try {
      // Create transport for Brave Search MCP server
      const braveApiKey = process.env.BRAVE_API_KEY;
      if (!braveApiKey) {
        throw new Error('BRAVE_API_KEY environment variable is required');
      }

      this.transport = new StdioClientTransport({
        command: 'npx',
        args: [
          '@modelcontextprotocol/server-brave-search',
          braveApiKey
        ],
        env: {
          ...process.env,
          BRAVE_API_KEY: braveApiKey
        }
      });

      // Create client
      this.client = new Client(
        {
          name: 'ai-news-aggregator',
          version: '1.0.0'
        },
        {
          capabilities: {
            tools: {}
          }
        }
      );

      // Connect to transport
      await this.client.connect(this.transport);

      console.log('Connected to Brave Search MCP server');
    } catch (error) {
      console.error('Failed to connect to Brave Search MCP server:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
  }

  async search(query: string): Promise<BraveSearchResponse> {
    if (!this.client) {
      throw new Error('MCP client not connected. Call connect() first.');
    }

    try {
      // List available tools first
      const tools = await this.client.listTools();
      console.log('Available tools:', tools);

      // Find the search tool
      const searchTool = tools.tools.find(tool =>
        tool.name === 'brave_web_search' ||
        tool.name === 'web_search' ||
        tool.name.includes('search')
      );

      if (!searchTool) {
        throw new Error('Search tool not found in MCP server');
      }

      // Call the search tool with rate-limit friendly settings
      const result = await this.client.callTool({
        name: searchTool.name,
        arguments: {
          query: query,
          count: 5, // Reduced count to minimize API usage
          safe_search: 'moderate',
          search_lang: 'en',
          freshness: 'd' // Search for recent content (last day)
        }
      });

      console.log('Search result:', result);

      // Parse the result
      if (result.content && Array.isArray(result.content) && result.content.length > 0) {
        const content = result.content[0];
        if (content.type === 'text') {
          // Check for rate limit or error messages
          if (content.text.includes('Rate limit exceeded') || content.text.includes('Error:')) {
            console.warn(`API Error for query "${query}": ${content.text}`);
            throw new Error(`Brave Search API Error: ${content.text}`);
          }

          try {
            // Try to parse as JSON first
            const parsedResult = JSON.parse(content.text);
            return {
              web: parsedResult.web || { results: [] },
              query
            };
          } catch (parseError) {
            console.log('Content is not JSON, parsing as plain text search results');

            // Parse the plain text format from Brave Search MCP
            const searchResults = this.parseTextSearchResults(content.text);
            return {
              web: { results: searchResults },
              query
            };
          }
        }
      }

      return {
        web: { results: [] },
        query
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  async searchMultiple(queries: string[]): Promise<BraveSearchResponse[]> {
    const results: BraveSearchResponse[] = [];

    // Process searches sequentially with delay to avoid rate limits
    for (const query of queries) {
      try {
        console.log(`Searching for: "${query}"`);
        const result = await this.search(query);
        results.push(result);

        // Add delay between requests to respect rate limits
        if (queries.indexOf(query) < queries.length - 1) {
          console.log('Waiting 2 seconds before next search...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Search failed for query "${query}":`, error);
        results.push({
          web: { results: [] },
          query
        });

        // Still add delay even on error to avoid overwhelming the API
        if (queries.indexOf(query) < queries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    return results;
  }
}

// Singleton instance for reuse
let braveClient: BraveMCPClient | null = null;

export async function getBraveClient(): Promise<BraveMCPClient> {
  if (!braveClient) {
    braveClient = new BraveMCPClient();
    await braveClient.connect();
  }
  return braveClient;
}

export async function closeBraveClient(): Promise<void> {
  if (braveClient) {
    await braveClient.disconnect();
    braveClient = null;
  }
}