import { BraveSearchResponse, SearchResult } from './mcp-client';

export interface NewsItem {
  title: string;
  url: string;
  summary: string;
  source: string;
  importance: 'high' | 'medium' | 'low';
  publishedAt?: string;
}

// AI-related keywords for importance scoring
const HIGH_IMPORTANCE_KEYWORDS = [
  'gpt-5', 'claude', 'gemini', 'breakthrough', 'breakthrough', 'revolutionary',
  'openai', 'anthropic', 'google ai', 'deepmind', 'major', 'announces'
];

const MEDIUM_IMPORTANCE_KEYWORDS = [
  'updates', 'improvement', 'enhancement', 'release', 'launch', 'new',
  'microsoft', 'meta', 'nvidia', 'ai model', 'machine learning'
];

// Extract domain name from URL for source
function extractSource(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}

// Calculate importance based on title and snippet content
function calculateImportance(title: string, snippet: string): 'high' | 'medium' | 'low' {
  const content = (title + ' ' + snippet).toLowerCase();

  // Check for high importance keywords
  if (HIGH_IMPORTANCE_KEYWORDS.some(keyword => content.includes(keyword))) {
    return 'high';
  }

  // Check for medium importance keywords
  if (MEDIUM_IMPORTANCE_KEYWORDS.some(keyword => content.includes(keyword))) {
    return 'medium';
  }

  return 'low';
}

// Clean and enhance snippet text
function processSnippet(snippet: string): string {
  // Remove extra whitespace and truncate if too long
  let processed = snippet.replace(/\s+/g, ' ').trim();

  // Truncate to reasonable length for summary
  if (processed.length > 300) {
    processed = processed.substring(0, 297) + '...';
  }

  return processed;
}

// Format published date
function formatPublishedDate(publishedDate?: string): string | undefined {
  if (!publishedDate) return undefined;

  try {
    const date = new Date(publishedDate);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) {
      return '1時間以内';
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}日前`;
    }
  } catch {
    return undefined;
  }
}

// Convert search results to news items
export function processSearchResults(searchResponses: BraveSearchResponse[]): NewsItem[] {
  const allResults: SearchResult[] = [];

  // Combine all search results
  searchResponses.forEach(response => {
    if (response.web?.results) {
      allResults.push(...response.web.results);
    }
  });

  // Remove duplicates based on URL
  const uniqueResults = allResults.filter((result, index, array) =>
    array.findIndex(r => r.url === result.url) === index
  );

  // Convert to NewsItem format
  const newsItems: NewsItem[] = uniqueResults.map(result => {
    const importance = calculateImportance(result.title, result.snippet);
    const source = extractSource(result.url);
    const summary = processSnippet(result.snippet);
    const publishedAt = formatPublishedDate(result.published_date);

    return {
      title: result.title,
      url: result.url,
      summary,
      source,
      importance,
      publishedAt
    };
  });

  // Sort by importance (high -> medium -> low) and then by title
  const sortedNews = newsItems.sort((a, b) => {
    const importanceOrder = { high: 3, medium: 2, low: 1 };
    const importanceDiff = importanceOrder[b.importance] - importanceOrder[a.importance];

    if (importanceDiff !== 0) {
      return importanceDiff;
    }

    return a.title.localeCompare(b.title);
  });

  // Limit to top 15 results to avoid overwhelming the user
  return sortedNews.slice(0, 15);
}

// AI news specific search queries
export const AI_NEWS_QUERIES = [
  'AI news today',
  'machine learning updates',
  'ChatGPT OpenAI news',
  'Claude Anthropic news',
  'Gemini Google AI',
  'AI breakthrough today',
  'artificial intelligence latest'
] as const;