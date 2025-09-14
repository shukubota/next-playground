import { NextRequest, NextResponse } from 'next/server';
import { getBraveClient, closeBraveClient } from '@/lib/mcp-client';
import { processSearchResults, AI_NEWS_QUERIES, NewsItem } from '@/lib/news-processor';

interface CollectionResponse {
  news: NewsItem[];
  totalCollected: number;
  queriesExecuted: string[];
  timestamp: string;
}

// Fallback mock data in case MCP connection fails
const generateFallbackNews = (errorType: 'rate-limit' | 'connection' | 'api-key' = 'connection'): NewsItem[] => {
  const fallbackMessages = {
    'rate-limit': {
      title: "検索制限に達しました - 少し時間をおいて再試行してください",
      summary: "Brave Search APIのレート制限に達しました。1分ほど待ってから再度お試しください。連続してリクエストを送信すると制限がかかります。",
    },
    'connection': {
      title: "AI News Collection Service Unavailable",
      summary: "現在、リアルタイムAIニュース収集サービスに接続できません。Brave Search MCP接続を確認してください。",
    },
    'api-key': {
      title: "API Key設定が必要です",
      summary: "Brave Search APIを使用するにはAPI Keyの設定が必要です。.envrcファイルにBRAVE_API_KEYを設定してください。",
    }
  };

  return [
    {
      title: fallbackMessages[errorType].title,
      url: "https://brave.com/search/api/",
      summary: fallbackMessages[errorType].summary,
      source: "System",
      importance: "low" as const,
      publishedAt: "Now"
    }
  ];
};

export async function POST(request: NextRequest) {
  let braveClient = null;

  try {
    console.log('Starting AI news collection...');

    // Check if BRAVE_API_KEY is available
    if (!process.env.BRAVE_API_KEY) {
      console.warn('BRAVE_API_KEY not found, using fallback data');
      const fallbackNews = generateFallbackNews('api-key');
      return NextResponse.json({
        news: fallbackNews,
        totalCollected: fallbackNews.length,
        queriesExecuted: ['fallback-no-api-key'],
        timestamp: new Date().toISOString()
      });
    }

    // Get MCP client and execute searches
    try {
      braveClient = await getBraveClient();
      console.log('Connected to Brave Search MCP');

      // Execute parallel searches
      const searchResults = await braveClient.searchMultiple([...AI_NEWS_QUERIES]);
      console.log(`Executed ${AI_NEWS_QUERIES.length} search queries`);

      // Process search results into news items
      const newsItems = processSearchResults(searchResults);
      console.log(`Processed ${newsItems.length} news items`);

      const response: CollectionResponse = {
        news: newsItems,
        totalCollected: newsItems.length,
        queriesExecuted: [...AI_NEWS_QUERIES],
        timestamp: new Date().toISOString()
      };

      return NextResponse.json(response);

    } catch (mcpError) {
      console.error('MCP connection/search error:', mcpError);

      // Determine error type for appropriate fallback
      const errorMessage = mcpError instanceof Error ? mcpError.message : String(mcpError);
      const isRateLimit = errorMessage.includes('Rate limit') || errorMessage.includes('rate limit');

      const errorType = isRateLimit ? 'rate-limit' : 'connection';
      const fallbackNews = generateFallbackNews(errorType);

      return NextResponse.json({
        news: fallbackNews,
        totalCollected: fallbackNews.length,
        queriesExecuted: [`fallback-${errorType}`],
        timestamp: new Date().toISOString(),
        error: isRateLimit
          ? 'レート制限のため一時的に利用できません。しばらくお待ちください。'
          : 'MCP接続エラーのため、フォールバックデータを使用しています'
      });
    }

  } catch (error) {
    console.error('News collection error:', error);
    return NextResponse.json(
      {
        error: 'ニュース収集中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // Note: We don't close the client here as it's a singleton
    // It will be reused for subsequent requests
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}