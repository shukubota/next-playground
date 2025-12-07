import { NextRequest, NextResponse } from 'next/server';

// Environment variables for Azure Image Generation
const azureImageEndpoint = process.env.AZURE_IMAGE_ENDPOINT;
const azureImageApiKey = process.env.AZURE_IMAGE_APIKEY;
const azureImageModel = process.env.AZURE_IMAGE_MODEL || 'gpt-image-1';

async function generateImageFromText(description: string): Promise<string> {
  try {
    // Validate environment variables
    if (!azureImageEndpoint || !azureImageApiKey || !azureImageModel) {
      throw new Error('Azure Image generation environment variables are required: AZURE_IMAGE_ENDPOINT, AZURE_IMAGE_APIKEY, AZURE_IMAGE_MODEL');
    }

    // Create a more descriptive prompt from the app description
    const imagePrompt = `Create an app icon design based on this description: ${description.substring(0, 500)}. 
    Style: Clean, modern app icon design with vibrant colors, simple geometric shapes, professional mobile app aesthetic, 
    centered composition, suitable for iOS/Android app stores. No text or words in the image.`;

    // Construct the URL for Azure Image Generation API
    const url = `${azureImageEndpoint}openai/deployments/${azureImageModel}/images/generations?api-version=2025-04-01-preview`;

    // Prepare the request payload
    const payload = {
      prompt: imagePrompt,
      size: "1024x1024",
      quality: "low", // Valid values: 'low', 'medium', 'high', 'auto'
      output_compression: 100,
      output_format: "png",
      n: 1
    };

    console.log('Calling Azure Image Generation with URL:', url);
    console.log('Prompt:', imagePrompt.substring(0, 100) + '...');

    // Make the HTTP request to Azure Image Generation
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${azureImageApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure Image Generation API Error:', errorText);
      throw new Error(`Azure Image Generation API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Azure Image Generation Response received');

    // Extract base64 image data
    const imageData = result.data?.[0]?.b64_json;

    if (!imageData) {
      throw new Error('No image data received from Azure Image Generation');
    }

    return imageData;

  } catch (error) {
    console.error('Error calling Azure Image Generation:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'アプリの説明文が必要です' },
        { status: 400 }
      );
    }

    // Rate limiting check (simple implementation)
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    console.log(`Image generation request from ${userAgent}: ${description.substring(0, 100)}...`);

    // Call Azure Image Generation
    const base64Image = await generateImageFromText(description);

    return NextResponse.json({ 
      image: base64Image,
      format: 'png'
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    let errorMessage = '画像生成中にエラーが発生しました';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('Azure Image generation environment variables')) {
        errorMessage = 'Azure画像生成機能が設定されていません';
        statusCode = 503;
      } else if (error.message.includes('auth') || error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'Azure画像生成の認証エラーが発生しました';
        statusCode = 503;
      } else if (error.message.includes('quota') || error.message.includes('rate') || error.message.includes('429')) {
        errorMessage = '画像生成の利用制限に達しました。しばらく待ってから再試行してください';
        statusCode = 429;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}