import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// Initialize Google Auth for Vertex AI
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const projectId = process.env.ANTHROPIC_VERTEX_PROJECT_ID;
const location = process.env.CLOUD_ML_REGION || 'us-east5';
const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4@20250514';

interface AIRequest {
  message: string;
}

interface AIResponse {
  response: string;
  isValid: boolean;
  validationErrors?: string[];
  metadata?: {
    responseTime: number;
    model: string;
  };
}

// Response validation logic
function validateResponse(response: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic validation rules
  if (!response || response.trim().length === 0) {
    errors.push('Response is empty');
  }
  
  if (response.length > 5000) {
    errors.push('Response is too long (max 5000 characters)');
  }
  
  if (response.length < 10) {
    errors.push('Response is too short (min 10 characters)');
  }
  
  // Check for inappropriate content (basic)
  const inappropriatePatterns = [
    /harmful/i,
    /dangerous/i,
    /illegal/i
  ];
  
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(response)) {
      errors.push('Response contains potentially inappropriate content');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Atlassian configuration
const atlassianConfig = {
  apiToken: process.env.ATLASSIAN_API_TOKEN,
  email: process.env.ATLASSIAN_EMAIL,
  domain: process.env.ATLASSIAN_DOMAIN
};

// Function to search Brave
async function searchBrave(query: string, limit = 30) {
  // Check configuration
  const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!braveApiKey) {
    throw new Error('Brave Search API key not configured. Please set BRAVE_SEARCH_API_KEY environment variable.');
  }

  console.log(`🔍 Searching Brave for: "${query}"`);

  // Build search URL with proper parameters
  // Brave API expects specific parameter names and limits
  const validLimit = Math.min(Math.max(limit, 1), 20); // Brave API limit is 1-20
  const searchParams = new URLSearchParams({
    q: query,
    count: validLimit.toString(),
    offset: '0',
    mkt: 'en-US',
    safesearch: 'moderate',
    textDecorations: 'false',
    textFormat: 'Raw'
  });
  
  const searchUrl = `https://api.search.brave.com/res/v1/web/search?${searchParams.toString()}`;

  console.log(`📡 API URL: ${searchUrl}`);

  // Make API request
  const response = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': braveApiKey
    }
  });

  console.log(`📊 Response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ API Error: ${errorText}`);

    let errorMessage = `Brave Search API error: ${response.status} ${response.statusText}`;
    if (response.status === 401) {
      errorMessage = 'Authentication failed. Please check your BRAVE_SEARCH_API_KEY';
    } else if (response.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later';
    }

    throw new Error(`${errorMessage}. Details: ${errorText}`);
  }

  const data = await response.json();
  const results = data.web?.results || [];

  console.log(`✅ Found ${results.length} results`);

  // Format results
  return results.map((item: any) => {
    const title = item.title || 'Untitled';
    const content = item.description || 'No description available';
    const url = item.url || '';

    return {
      title,
      content,
      url
    };
  });
}

// Function to search Confluence
async function searchConfluence(query: string, limit = 30) {
  // Check configuration
  if (!atlassianConfig.apiToken || !atlassianConfig.email || !atlassianConfig.domain) {
    throw new Error('Atlassian configuration incomplete. Please set ATLASSIAN_API_TOKEN, ATLASSIAN_EMAIL, and ATLASSIAN_DOMAIN environment variables.');
  }

  console.log(`🔍 Searching Confluence for: "${query}"`);

  const baseUrl = atlassianConfig.domain.includes('.atlassian.net') 
    ? `https://${atlassianConfig.domain}`
    : `https://${atlassianConfig.domain}.atlassian.net`;

  // Build search URL with enhanced CQL
  // Extract key terms from the query for more targeted search
  function extractSearchTerms(searchQuery: string) {
    const terms = searchQuery.toLowerCase();
    const keywords: string[] = [];
    
    // Check for specific known pages
    const knownPages = {
      'サポートページの正しい構成や作成時の規則': '3190390799',
      'サポートページ 規則': '3190390799',
      'サポートページ 構成': '3190390799'
    };
    
    // Check if query matches a known page
    for (const [pattern, pageId] of Object.entries(knownPages)) {
      if (terms.includes(pattern.toLowerCase()) || 
          pattern.toLowerCase().split(' ').every(word => terms.includes(word))) {
        return { 
          keywords, 
          isProductRelated: true, 
          productKeywords: [pattern],
          specificPageId: pageId
        };
      }
    }
    
    // Common terms that should be searched in product space
    const productSpaceKeywords = ['サポートページ', '起票規則', '構成', '作成時', 'メンテナンス', 'アップデート', '規則'];
    const foundProductKeywords = productSpaceKeywords.filter(keyword => terms.includes(keyword.toLowerCase()));
    
    // Extract specific phrases from the query
    const words = searchQuery.split(/\s+/);
    words.forEach(word => {
      if (word.length > 1) {
        keywords.push(word.trim());
      }
    });
    
    return { 
      keywords, 
      isProductRelated: foundProductKeywords.length > 0, 
      productKeywords: foundProductKeywords,
      specificPageId: undefined
    };
  }
  
  const searchTerms = extractSearchTerms(query);
  
  // If we detected a specific page, use direct page retrieval instead of search
  if (searchTerms.specificPageId) {
    console.log(`🎯 Known page detected! Retrieving page ID: ${searchTerms.specificPageId}`);
    try {
      const pageData = await getConfluencePage(searchTerms.specificPageId);
      return [pageData];
    } catch (error) {
      console.error(`❌ Failed to get specific page ${searchTerms.specificPageId}:`, error);
      // Fall back to search if direct retrieval fails
    }
  }
  
  let cqlQuery;
  if (searchTerms.isProductRelated) {
    // Try multiple CQL strategies for product space
    const strategies = [
      // Strategy 1: Exact phrase search
      `space = "product" AND text ~ "${query}"`,
      // Strategy 2: Individual keywords with OR
      `space = "product" AND (${searchTerms.keywords.map(term => `text ~ "${term}"`).join(' OR ')})`,
      // Strategy 3: Title-focused search
      `space = "product" AND (${searchTerms.keywords.map(term => `title ~ "${term}"`).join(' OR ')})`,
      // Strategy 4: Broader search in product space
      `space = "product" AND type = "page"`
    ];
    
    // Use the first strategy, but we could try multiple
    cqlQuery = strategies[0];
    console.log(`🎯 Product space search detected. Keywords: ${searchTerms.keywords.join(', ')}`);
    console.log(`🔍 Using strategy: ${cqlQuery}`);
  } else {
    // General search with title priority
    cqlQuery = `title ~ "${query}" OR text ~ "${query}"`;
  }
  
  const searchUrl = `${baseUrl}/wiki/rest/api/search?cql=${encodeURIComponent(cqlQuery)}&limit=${limit}&expand=content.body.storage,content.space`;

  console.log(`📡 CQL Query: ${cqlQuery}`);
  console.log(`📡 API URL: ${searchUrl}`);

  // Prepare authentication
  const authHeader = Buffer.from(`${atlassianConfig.email}:${atlassianConfig.apiToken}`).toString('base64');

  // Make API request
  const response = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  console.log(`📊 Response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ API Error: ${errorText}`);

    let errorMessage = `Confluence API error: ${response.status} ${response.statusText}`;
    if (response.status === 401) {
      errorMessage = 'Authentication failed. Please check your ATLASSIAN_EMAIL and ATLASSIAN_API_TOKEN';
    } else if (response.status === 404) {
      errorMessage = 'Confluence API endpoint not found. Please check your ATLASSIAN_DOMAIN setting';
    }

    throw new Error(`${errorMessage}. Details: ${errorText}`);
  }

  const data = await response.json();
  const results = data.results || [];

  console.log(`✅ Found ${results.length} results`);

  // Format results with additional metadata
  return results.map((item: any) => {
    const title = item.content?.title || item.title || 'Untitled';
    const content = item.excerpt || item.content?.body?.storage?.value?.substring(0, 500) || 'No content preview available';
    const url = `${baseUrl}${item.content?._links?.webui || item.url || ''}`;
    const pageId = item.content?.id || '';
    const spaceKey = item.content?.space?.key || '';

    return {
      title,
      content,
      url,
      pageId,
      spaceKey
    };
  });
}

// Function to get specific Confluence page by ID
async function getConfluencePage(pageId: string) {
  // Check configuration
  if (!atlassianConfig.apiToken || !atlassianConfig.email || !atlassianConfig.domain) {
    throw new Error('Atlassian configuration incomplete. Please set ATLASSIAN_API_TOKEN, ATLASSIAN_EMAIL, and ATLASSIAN_DOMAIN environment variables.');
  }

  console.log(`🔍 Getting Confluence page: ${pageId}`);

  // Handle domain format
  const baseUrl = atlassianConfig.domain.includes('.atlassian.net') 
    ? `https://${atlassianConfig.domain}`
    : `https://${atlassianConfig.domain}.atlassian.net`;

  // Build page URL
  const pageUrl = `${baseUrl}/wiki/rest/api/content/${pageId}?expand=body.storage,space`;

  console.log(`📡 Page URL: ${pageUrl}`);

  // Prepare authentication
  const authHeader = Buffer.from(`${atlassianConfig.email}:${atlassianConfig.apiToken}`).toString('base64');

  // Make API request
  const response = await fetch(pageUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  console.log(`📊 Response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ API Error: ${errorText}`);
    throw new Error(`Failed to get page ${pageId}: ${response.status} ${response.statusText}`);
  }

  const page = await response.json();

  return {
    title: page.title,
    content: page.body?.storage?.value?.substring(0, 1000) || 'No content available',
    url: `${baseUrl}${page._links?.webui}`,
    pageId: page.id,
    spaceKey: page.space?.key
  };
}

async function callClaudeViaVertexWithTools(message: string) {
  try {
    // Validate environment variables
    if (!projectId) {
      throw new Error('ANTHROPIC_VERTEX_PROJECT_ID environment variable is required');
    }

    // Get access token for Vertex AI
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    // Construct the URL for Vertex AI Claude API
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/anthropic/models/${model}:rawPredict`;

    // Prepare the request payload with tools
    const payload = {
      anthropic_version: 'vertex-2023-10-16',
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 2048,
      temperature: 0.7,
      tools: [
        {
          name: 'search_confluence',
          description: 'Search for content in Atlassian Confluence. Use this when the user asks about finding information in Confluence, documentation, or company wiki.',
          input_schema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for Confluence content'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 30, max: 20 for Brave)',
                default: 30
              }
            },
            required: ['query']
          }
        },
        {
          name: 'search_brave',
          description: 'Search the internet using Brave Search. Use this when the user asks about current information, general knowledge, or content not available in internal documentation.',
          input_schema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for web content'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 30, max: 20 for Brave)',
                default: 30
              }
            },
            required: ['query']
          }
        },
        {
          name: 'get_confluence_page',
          description: 'Get a specific Confluence page by ID. Use this when you have a specific page ID (like 3190390799) that you need to retrieve, or when search results seem incomplete.',
          input_schema: {
            type: 'object',
            properties: {
              pageId: {
                type: 'string',
                description: 'The Confluence page ID (e.g., "3190390799" for the support page rules)'
              }
            },
            required: ['pageId']
          }
        }
      ]
    };

    console.log(`\n📤 Calling Claude via Vertex AI (${model}) with tools...`);

    let conversationHistory = [payload];
    let finalResponse = '';

    // Handle potential tool usage in a loop
    while (true) {
      const currentPayload = conversationHistory[conversationHistory.length - 1];
      
      // Make the HTTP request to Vertex AI
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      // Extract Claude's response
      let responseText = '';
      let toolUse = null;

      if (result.content && result.content.length > 0) {
        for (const content of result.content) {
          if (content.type === 'text') {
            responseText += content.text;
          } else if (content.type === 'tool_use') {
            toolUse = content;
          }
        }
      }

      // If Claude wants to use a tool
      if (toolUse) {
        console.log(`🔧 Claude wants to use tool: ${toolUse.name}`);
        console.log(`🔧 Tool arguments:`, toolUse.input);

        let toolResult;
        try {
          if (toolUse.name === 'search_confluence') {
            const searchResults = await searchConfluence(toolUse.input.query, toolUse.input.limit || 30);
            
            if (searchResults.length === 0) {
              toolResult = `No Confluence pages found for query: "${toolUse.input.query}"`;
            } else {
              toolResult = `Found ${searchResults.length} Confluence page(s):\n\n` +
                searchResults.map((item: any, index: number) => 
                  `${index + 1}. **${item.title}**\n   URL: ${item.url}\n   Content: ${item.content}\n`
                ).join('\n');
            }
          } else if (toolUse.name === 'search_brave') {
            const searchResults = await searchBrave(toolUse.input.query, toolUse.input.limit || 30);
            
            if (searchResults.length === 0) {
              toolResult = `No web results found for query: "${toolUse.input.query}"`;
            } else {
              toolResult = `Found ${searchResults.length} web result(s):\n\n` +
                searchResults.map((item: any, index: number) => 
                  `${index + 1}. **${item.title}**\n   URL: ${item.url}\n   Content: ${item.content}\n`
                ).join('\n');
            }
          } else if (toolUse.name === 'get_confluence_page') {
            const pageData = await getConfluencePage(toolUse.input.pageId);
            
            toolResult = `Retrieved Confluence page:\n\n**${pageData.title}**\n   URL: ${pageData.url}\n   Page ID: ${pageData.pageId}\n   Space: ${pageData.spaceKey}\n   Content: ${pageData.content}\n`;
          } else {
            toolResult = `Error: Unknown tool ${toolUse.name}`;
          }
        } catch (error) {
          console.error(`❌ Tool execution error:`, error);
          toolResult = `Error using ${toolUse.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }

        console.log(`🔧 Tool result:`, toolResult.substring(0, 200) + '...');

        // Continue the conversation with tool result
        const nextPayload = {
          anthropic_version: 'vertex-2023-10-16',
          messages: [
            ...currentPayload.messages,
            {
              role: 'assistant',
              content: result.content
            },
            {
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: toolUse.id,
                  content: toolResult
                }
              ]
            }
          ],
          max_tokens: 2048,
          temperature: 0.7,
          tools: currentPayload.tools
        };

        conversationHistory.push(nextPayload);
        continue;
      } else {
        // No tool use, this is the final response
        finalResponse = responseText;
        break;
      }
    }

    if (!finalResponse) {
      throw new Error('No response text received from Claude');
    }

    return finalResponse;

  } catch (error) {
    console.error('Error calling Claude via Vertex AI:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const body: AIRequest = await request.json();
    
    if (!body.message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log("Received message:", body.message);
    
    try {
      // Call Claude via Vertex AI with tools (Claude decides when to use them)
      const responseText = await callClaudeViaVertexWithTools(body.message);
      
      const responseTime = Date.now() - startTime;
      
      // Validate the response
      const validation = validateResponse(responseText);
      
      const aiResponse: AIResponse = {
        response: responseText,
        isValid: validation.isValid,
        validationErrors: validation.errors,
        metadata: {
          responseTime,
          model: model,
        },
      };
      
      return NextResponse.json(aiResponse);
      
    } catch (vertexError) {
      console.error('Vertex AI Error:', vertexError);
      
      // Fallback to mock response if Vertex AI fails
      const fallbackResponse = `Vertex AI経由でClaudeを呼び出そうとしましたが、エラーが発生しました。

エラー: ${vertexError instanceof Error ? vertexError.message : 'Unknown error'}

あなたのメッセージ「${body.message}」は受信しました。
Google Cloud認証の設定を確認してください。

認証設定方法:
1. gcloud auth application-default login
2. または GOOGLE_APPLICATION_CREDENTIALS 環境変数を設定

現在はフォールバックレスポンスを返しています。`;

      const responseTime = Date.now() - startTime;
      
      // Validate the fallback response
      const validation = validateResponse(fallbackResponse);
      
      const aiResponse: AIResponse = {
        response: fallbackResponse,
        isValid: validation.isValid,
        validationErrors: validation.errors,
        metadata: {
          responseTime,
          model: `${model} (fallback)`,
        },
      };
      
      return NextResponse.json(aiResponse);
    }
    
  } catch (error) {
    console.error('AI Agent API Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate AI response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}