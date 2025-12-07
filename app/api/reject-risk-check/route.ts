import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { formData } = await request.json();

    // Read reject.mhtml file
    const rejectFilePath = path.join(process.cwd(), 'reject.mhtml');
    let rejectContent = '';
    
    try {
      rejectContent = fs.readFileSync(rejectFilePath, 'utf-8');
    } catch (error) {
      console.error('Failed to read reject.mhtml:', error);
      rejectContent = 'リジェクト情報ファイルが見つかりません。';
    }

    // Prepare the prompt for Azure OpenAI
    const prompt = `
あなたはアプリストアの審査専門家です。以下のアプリ申請情報を分析し、リジェクトされるリスクを評価してください。

【申請情報】
アプリ名: ${formData.appName}
サブタイトル: ${formData.subtitle || 'なし'}
カテゴリ: ${formData.category1} ${formData.category2 ? `/ ${formData.category2}` : ''}
プロモーションテキスト: ${formData.promoText || 'なし'}
概要: ${formData.description}
キーワード: ${formData.keywords}
バージョン情報: ${formData.versionInfo || 'なし'}

【過去のリジェクト情報】
${rejectContent.substring(0, 5000)}

【分析指示】
1. 申請情報を詳細に分析し、以下の観点からリジェクトリスクを評価してください：
   - Apple App Store / Google Play ガイドライン違反の可能性
   - メタデータの適切性（誤解を招く表現、誇張表現）
   - 説明文の表現問題（禁止キーワード、不適切な比較表現）
   - カテゴリの適合性
   - キーワードの適切性（関連性、重複、商標問題）
   - プライバシー・セキュリティに関する記述の妥当性
   - 年齢制限・コンテンツレーティングの適合性

2. 総合リスクレベルを分類：
   - 🟢 低リスク: 問題なし、審査通過の可能性が高い
   - 🟡 中リスク: 一部改善が推奨される
   - 🔴 高リスク: リジェクトの可能性が高い、要修正

3. 各項目別のリスク評価と具体的な改善提案を提供してください。

4. 回答は以下の構造で日本語で出力してください：
   ## 総合リスク評価
   ## 項目別分析
   ## 改善提案
   ## 推奨アクション
`;

    // Call Azure OpenAI API
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://kubota.cognitiveservices.azure.com/';
    const deploymentName = process.env.AZURE_OPENAI_MODEL_NAME || 'gpt-4.1-mini';
    const apiVersion = '2024-08-01-preview';
    
    const openaiResponse = await fetch(`${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_APIKEY || '',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('Azure OpenAI API error:', errorData);
      throw new Error('Azure OpenAI API の呼び出しに失敗しました');
    }

    // Create a readable stream to handle the streaming response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const reader = openaiResponse.body?.getReader();
          if (!reader) {
            throw new Error('Failed to get response reader');
          }

          let buffer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  continue;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Reject risk check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'リジェクトリスク分析に失敗しました' },
      { status: 500 }
    );
  }
}