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
      // Get access token for Vertex AI
      const authClient = await auth.getClient();
      const accessToken = await authClient.getAccessToken();
      
      // Construct the URL for Vertex AI Claude API (rawPredict for direct Anthropic format)
      const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/anthropic/models/${model}:rawPredict`;
      
      // Prepare the request payload for Vertex AI Claude (Anthropic format)
      const payload = {
        anthropic_version: 'vertex-2023-10-16',
        messages: [
          {
            role: 'user',
            content: body.message,
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      };

      console.log('Calling Vertex AI with URL:', url);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      // Make the HTTP request to Vertex AI
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Vertex AI Response:', JSON.stringify(result, null, 2));
      
      // Extract the response text from Vertex AI Claude response
      let responseText = '';
      if (result.content && result.content.length > 0) {
        responseText = result.content[0].text || '';
      } else if (result.predictions && result.predictions.length > 0) {
        // Fallback for different response format
        const prediction = result.predictions[0];
        if (prediction.content && prediction.content.length > 0) {
          responseText = prediction.content[0].text || '';
        }
      }
      
      if (!responseText) {
        throw new Error('No response text received from Claude');
      }
      
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