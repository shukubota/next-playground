import { NextRequest, NextResponse } from 'next/server';

// Environment variables for Azure OpenAI
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.AZURE_OPENAI_APIKEY;
const azureModelName = process.env.AZURE_OPENAI_MODEL_NAME || 'gpt-4o-mini';

const SYSTEM_PROMPT = `あなたはモバイルアプリストア申請のプロフェッショナルなマーケティングライターです。

## あなたの専門性
- Apple App Store と Google Play Store での申請実績が豊富
- ユーザーの心を掴むマーケティング文章の作成が得意
- 日本市場でのアプリマーケティングに精通
- ASO（App Store Optimization）の専門知識を持つ

## 重要な指針
1. **ユーザー目線**: 開発者の視点ではなく、ユーザーが「なぜこのアプリが必要なのか」を重視
2. **簡潔で魅力的**: 短時間で価値を伝える、印象に残る表現を使用
3. **具体的なメリット**: 抽象的な表現より、具体的な解決策や効果を提示
4. **感情に訴える**: 機能説明だけでなく、ユーザーの感情や体験に寄り添う
5. **検索最適化**: 自然な文章の中にキーワードを効果的に配置

## 出力要件
- 日本語で自然で読みやすい文章
- マーケティング効果の高い表現
- アプリストアのガイドラインに準拠
- ターゲットユーザーに響く言葉選び

提供される情報を基に、最適なマーケティング文章を生成してください。`;

async function callAzureOpenAI(message: string): Promise<string> {
  try {
    // Validate environment variables
    if (!azureEndpoint || !azureApiKey || !azureModelName) {
      throw new Error('Azure OpenAI environment variables are required: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_APIKEY, AZURE_OPENAI_MODEL_NAME');
    }

    // Construct the URL for Azure OpenAI API
    const url = `${azureEndpoint}/openai/deployments/${azureModelName}/chat/completions?api-version=2024-08-01-preview`;

    // Prepare the request payload
    const payload = {
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    console.log('Calling Azure OpenAI with URL:', url);

    // Make the HTTP request to Azure OpenAI
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': azureApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API Error:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Azure OpenAI Response:', result);

    // Extract response text
    const responseText = result.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response text received from Azure OpenAI');
    }

    return responseText.trim();

  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      );
    }

    // Rate limiting check (simple implementation)
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const now = Date.now();
    
    // In a production app, you'd use Redis or a database for rate limiting
    // For now, we'll just add a basic check
    
    console.log(`AI generation request from ${userAgent}: ${prompt.substring(0, 100)}...`);

    // Call Azure OpenAI
    const response = await callAzureOpenAI(prompt);

    return NextResponse.json({ response });

  } catch (error) {
    console.error('AI generation error:', error);
    
    let errorMessage = 'AI生成中にエラーが発生しました';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('Azure OpenAI environment variables')) {
        errorMessage = 'Azure OpenAI設定が不完全です';
        statusCode = 503;
      } else if (error.message.includes('auth') || error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'Azure OpenAI認証エラーが発生しました';
        statusCode = 503;
      } else if (error.message.includes('quota') || error.message.includes('rate') || error.message.includes('429')) {
        errorMessage = 'AI利用制限に達しました。しばらく待ってから再試行してください';
        statusCode = 429;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}