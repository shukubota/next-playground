import { useState } from 'react';

interface AIHintButtonProps {
  onGenerate: (generatedText: string) => void;
  context: {
    appName?: string;
    category?: string;
    companyName?: string;
    [key: string]: any;
  };
  fieldType: 'description' | 'promoText' | 'keywords' | 'versionInfo';
  disabled?: boolean;
  className?: string;
}

export default function AIHintButton({
  onGenerate,
  context,
  fieldType,
  disabled = false,
  className = ''
}: AIHintButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPromptForFieldType = (type: string, context: any) => {
    const appName = context.appName || 'このアプリ';
    const category = context.category1 || context.category || 'アプリケーション';
    const companyName = context.companyName || '開発会社';

    switch (type) {
      case 'description':
        return `アプリストア用の魅力的なアプリ説明文を生成してください。
アプリ名: ${appName}
カテゴリ: ${category}
開発会社: ${companyName}

要件:
- ユーザーの課題を明確にし、解決策を提示
- アプリの主要機能とメリットを具体的に説明
- ターゲットユーザーに響く表現を使用
- 400-800文字程度
- 日本語で作成`;

      case 'promoText':
        return `アプリストア用の短いプロモーション文を生成してください。
アプリ名: ${appName}
カテゴリ: ${category}

要件:
- キャッチーで印象的な表現
- アプリの核となる価値を簡潔に表現
- 30-50文字程度
- 日本語で作成`;

      case 'keywords':
        return `アプリストア検索用のキーワードを生成してください。
アプリ名: ${appName}
カテゴリ: ${category}

要件:
- 検索されやすいキーワードを10-15個
- カンマ区切りで出力
- 関連する機能や用途を含める
- 日本語で作成`;

      case 'versionInfo':
        return `アプリのバージョン更新情報を生成してください。
アプリ名: ${appName}

要件:
- 一般的なアプリ更新内容を想定
- ユーザーにとって有益な改善点を含める
- 50-150文字程度
- 日本語で作成`;

      default:
        return `${appName}に関する${type}を生成してください。`;
    }
  };

  const generateContent = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const prompt = getPromptForFieldType(fieldType, context);
      
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      onGenerate(data.response);
    } catch (error) {
      console.error('AI generation error:', error);
      setError(error instanceof Error ? error.message : 'AI生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonText = () => {
    if (isGenerating) return '生成中...';
    
    switch (fieldType) {
      case 'description':
        return 'AI説明文生成';
      case 'promoText':
        return 'AIプロモ文生成';
      case 'keywords':
        return 'AIキーワード生成';
      case 'versionInfo':
        return 'AI更新情報生成';
      default:
        return 'AI生成';
    }
  };

  // Debug: Check what context is being passed
  console.log(`AIHintButton for ${fieldType}:`, {
    appName: context.appName,
    category1: context.category1,
    disabled: disabled || isGenerating
  });

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <button
        type="button"
        onClick={generateContent}
        disabled={disabled || isGenerating}
        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition duration-200"
        style={{
          backgroundColor: disabled || isGenerating ? '#aaabab' : '#30acab',
          color: 'white',
          cursor: disabled || isGenerating ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => !disabled && !isGenerating && ((e.target as HTMLButtonElement).style.backgroundColor = '#00579c')}
        onMouseLeave={(e) => !disabled && !isGenerating && ((e.target as HTMLButtonElement).style.backgroundColor = '#30acab')}
      >
        {isGenerating && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        
        {getButtonText()}
      </button>
      
      {error && (
        <p className="text-xs p-2 rounded border" style={{color: '#0f4490', backgroundColor: '#d1eaf8', borderColor: '#7fc5da'}}>
          {error}
        </p>
      )}
    </div>
  );
}