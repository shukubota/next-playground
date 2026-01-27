import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_AI_API_KEY environment variable is required");
    return;
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  // 検証対象の画像ファイルパスを指定
  const filePath = "/Users/shu.kubota/myproject/next-playground/scripts/gemini/gemini-3-pro-image-preview_en.png";
  
  if (!fs.existsSync(filePath)) {
    console.error(`ファイルが見つかりません: ${filePath}`);
    return;
  }

  console.log(`=== SynthID検証開始 ===`);
  console.log(`検証対象: ${path.basename(filePath)}\n`);

  // SynthID検証を実行
  const imageFile = {
    name: path.basename(filePath),
    path: filePath
  };
  
  await checkSynthID(ai, imageFile);

  console.log("\n=== SynthID検証完了 ===");
}


// SynthID検証を実行
async function checkSynthID(ai, imageFile) {
  console.log(`--- ${imageFile.name} の検証 ---`);
  
  try {
    // 画像ファイルを読み込み
    const imageData = fs.readFileSync(imageFile.path);
    const base64Image = imageData.toString("base64");
    const mimeType = getMimeType(imageFile.name);
    
    const startTime = Date.now();
    
    // SynthID検証用のプロンプト
    const prompt = [
      { 
        text: `この画像がAI生成画像かどうか、またSynthID（Google の透かし技術）が含まれているかどうかを分析してください。以下の項目について詳細に回答してください：

1. AI生成画像の可能性（高/中/低）とその根拠
2. SynthIDまたは類似の透かし技術の検出結果
3. 画像の特徴的な要素（画質、ノイズパターン、不自然な部分等）
4. 推定される生成ツール（Gemini、DALL-E、Midjourney等）
5. 信頼度スコア（0-100%）

技術的な観点から詳細に分析してください。`
      },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
    ];

    // Geminiで分析実行
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const endTime = Date.now();
    const latency = endTime - startTime;

    if (!response.candidates || response.candidates.length === 0) {
      console.log("❌ 分析結果を取得できませんでした");
      return;
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      console.log("❌ レスポンス内容が不正です");
      return;
    }

    const textPart = candidate.content.parts.find(part => part.text);
    if (textPart) {
      console.log("📊 分析結果:");
      console.log(textPart.text);
      
    } else {
      console.log("❌ テキスト分析結果が見つかりませんでした");
    }

    console.log(`⏱️  処理時間: ${latency}ms (${(latency / 1000).toFixed(2)}秒)\n`);

  } catch (error) {
    console.error(`❌ エラー発生 (${imageFile.name}):`, error.message);
  }
}

// MIMEタイプを取得
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'image/png';
}



main().catch(console.error);