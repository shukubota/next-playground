'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  url: string;
  summary: string;
  source: string;
  importance: 'high' | 'medium' | 'low';
  publishedAt?: string;
}

interface CollectionStatus {
  isCollecting: boolean;
  progress: number;
  currentTask: string;
  completedTasks: string[];
  totalTasks: number;
}

interface CollectionButtonProps {
  onStartCollection: (customTopic?: string) => void;
  isCollecting: boolean;
}

function CollectionButton({ onStartCollection, isCollecting }: CollectionButtonProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  const handleDefaultCollection = () => {
    onStartCollection();
  };

  const handleCustomCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim()) {
      onStartCollection(customTopic.trim());
      setCustomTopic('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="text-center mb-8">
      {/* Default collection button */}
      <div className="mb-4">
        <button
          onClick={handleDefaultCollection}
          disabled={isCollecting}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
        >
          <svg
            className={`w-6 h-6 mr-3 ${isCollecting ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollecting ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            )}
          </svg>
          {isCollecting ? 'AIニュースを収集中...' : '今日のAIニュースを収集'}
        </button>
      </div>

      {/* Custom topic toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          disabled={isCollecting}
          className="text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition-colors duration-200"
        >
          {showCustomInput ? '標準収集に戻る' : 'カスタムトピックで収集'}
        </button>
      </div>

      {/* Custom input form */}
      {showCustomInput && (
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleCustomCollection} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              カスタムニュース収集
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              収集したいニュースのテーマを自由に入力してください。ClaudeがBrave Searchに最適なクエリを生成します。
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="customTopic" className="block text-sm font-medium text-gray-700 mb-2">
                  ニューストピック
                </label>
                <textarea
                  id="customTopic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="例：量子コンピューティングの最新研究、日本のAIスタートアップ動向、生成AIの規制動向など"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isCollecting}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  disabled={isCollecting}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition-colors duration-200"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isCollecting || !customTopic.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isCollecting ? '収集中...' : 'カスタム収集開始'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

interface ProgressIndicatorProps {
  status: CollectionStatus;
}

function ProgressIndicator({ status }: ProgressIndicatorProps) {
  if (!status.isCollecting && status.completedTasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">収集進行状況</h3>
        <span className="text-sm text-gray-500">
          {status.completedTasks.length} / {status.totalTasks} 完了
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${status.progress}%` }}
        ></div>
      </div>

      {status.isCollecting && (
        <div className="flex items-center text-blue-600 mb-4">
          <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm font-medium">{status.currentTask}</span>
        </div>
      )}

      <div className="space-y-2">
        {status.completedTasks.map((task, index) => (
          <div key={index} className="flex items-center text-green-600 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {task}
          </div>
        ))}
      </div>
    </div>
  );
}

interface NewsItemComponentProps {
  news: NewsItem;
}

function NewsItemComponent({ news }: NewsItemComponentProps) {
  const importanceColors = {
    high: 'border-red-400 bg-red-50',
    medium: 'border-yellow-400 bg-yellow-50',
    low: 'border-green-400 bg-green-50'
  };

  const importanceLabels = {
    high: '重要',
    medium: '普通',
    low: '参考'
  };

  const importanceBadgeColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${importanceColors[news.importance]} hover:shadow-xl transition-shadow duration-300`}>
      <div className="flex justify-between items-start mb-3">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${importanceBadgeColors[news.importance]}`}>
          {importanceLabels[news.importance]}
        </span>
        <span className="text-xs text-gray-500">{news.source}</span>
      </div>

      <h3 className="text-xl font-bold mb-3 text-gray-900 leading-tight">
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors duration-200"
        >
          {news.title}
        </a>
      </h3>

      <p className="text-gray-700 mb-4 leading-relaxed">{news.summary}</p>

      <div className="flex justify-between items-center">
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
        >
          記事を読む
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        {news.publishedAt && (
          <span className="text-xs text-gray-500">{news.publishedAt}</span>
        )}
      </div>
    </div>
  );
}

interface NewsSummaryListProps {
  news: NewsItem[];
  error: string | null;
}

function NewsSummaryList({ news, error }: NewsSummaryListProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-red-800 font-semibold mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          エラーが発生しました
        </h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p className="text-gray-600">「今日のAIニュースを収集」ボタンを押して、最新のAIニュースを取得してください。</p>
      </div>
    );
  }

  const sortedNews = [...news].sort((a, b) => {
    const importanceOrder = { high: 3, medium: 2, low: 1 };
    return importanceOrder[b.importance] - importanceOrder[a.importance];
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">
          今日のAIニュース ({news.length}件)
        </h3>
        <div className="flex gap-2 text-sm">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-red-400 rounded-full mr-1"></span>
            重要 {news.filter(n => n.importance === 'high').length}
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></span>
            普通 {news.filter(n => n.importance === 'medium').length}
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-400 rounded-full mr-1"></span>
            参考 {news.filter(n => n.importance === 'low').length}
          </span>
        </div>
      </div>

      {sortedNews.map((newsItem, index) => (
        <NewsItemComponent key={index} news={newsItem} />
      ))}
    </div>
  );
}

export default function DevNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState<CollectionStatus>({
    isCollecting: false,
    progress: 0,
    currentTask: '',
    completedTasks: [],
    totalTasks: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [lastCustomTopic, setLastCustomTopic] = useState<string | null>(null);
  const [queryOptimization, setQueryOptimization] = useState<{
    reasoning: string;
    originalTopic: string;
  } | null>(null);

  const startCollection = async (customTopic?: string) => {
    setError(null);

    const isCustom = !!customTopic;
    const taskCount = isCustom ? 5 : 7; // カスタムの場合は少し少なめ

    setStatus({
      isCollecting: true,
      progress: 0,
      currentTask: isCustom ? 'カスタムトピックを分析中...' : '収集を開始しています...',
      completedTasks: [],
      totalTasks: taskCount
    });

    try {
      const response = await fetch('/api/dev-news/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customTopic: customTopic
        }),
      });

      if (!response.ok) {
        throw new Error(`Collection failed: ${response.statusText}`);
      }

      const data = await response.json();
      setNews(data.news || []);
      setLastCustomTopic(data.customTopic || null);
      setQueryOptimization(data.queryOptimization || null);

      const completedTasks = isCustom ? [
        'カスタムトピックを分析',
        '検索クエリを生成',
        '関連ニュースを検索',
        '結果を処理',
        'サマリを生成'
      ] : [
        'AI news today を検索',
        'machine learning updates を検索',
        'ChatGPT OpenAI news を検索',
        'Claude Anthropic news を検索',
        'Gemini Google AI を検索',
        'AI breakthrough today を検索',
        '結果を統合してサマリを生成'
      ];

      setStatus({
        isCollecting: false,
        progress: 100,
        currentTask: '完了',
        completedTasks,
        totalTasks: taskCount
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ニュース収集中にエラーが発生しました');
      setStatus(prev => ({ ...prev, isCollecting: false }));
    }
  };

  useEffect(() => {
    if (status.isCollecting) {
      const tasks = [
        'AI news today を検索中...',
        'machine learning updates を検索中...',
        'ChatGPT OpenAI news を検索中...',
        'Claude Anthropic news を検索中...',
        'Gemini Google AI を検索中...',
        'AI breakthrough today を検索中...',
        '結果を統合してサマリを生成中...'
      ];

      let currentTaskIndex = 0;
      const interval = setInterval(() => {
        if (currentTaskIndex < tasks.length) {
          setStatus(prev => ({
            ...prev,
            currentTask: tasks[currentTaskIndex],
            progress: ((currentTaskIndex + 1) / tasks.length) * 85,
            completedTasks: tasks.slice(0, currentTaskIndex).map(task => task.replace('中...', ''))
          }));
          currentTaskIndex++;
        } else {
          clearInterval(interval);
        }
      }, 3000); // レート制限対応で3秒間隔に変更

      return () => clearInterval(interval);
    }
  }, [status.isCollecting]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI News Aggregator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            朝のルーティンに最適。ワンクリックで最新のAI関連ニュースを自動収集し、
            重要度別にサマリを表示します。
          </p>
        </div>

        <CollectionButton onStartCollection={startCollection} isCollecting={status.isCollecting} />

        <ProgressIndicator status={status} />

        {queryOptimization && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              クエリ最適化結果
            </h3>
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>元のトピック:</strong> {queryOptimization.originalTopic}
              </p>
              <p className="text-sm text-gray-700">{queryOptimization.reasoning}</p>
            </div>
          </div>
        )}

        <NewsSummaryList news={news} error={error} />
      </div>
    </div>
  );
}