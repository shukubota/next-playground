import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_AI_API_KEY environment variable is required");
    return;
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const imagePath = "/Users/shu.kubota/Desktop/banner_original.png";
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  // 変換対象言語の定義
  const languages = [
    { name: "英語", code: "en", prompt: "このバナー広告画像を英語に変更して。変換後に日本語が含まれていないことを確認して。" },
    { name: "中国語", code: "zh", prompt: "このバナー広告画像を中国語（簡体字）に変更して。変換後に日本語が含まれていないことを確認して。" },
    { name: "ドイツ語", code: "de", prompt: "このバナー広告画像をドイツ語に変更して。変換後に日本語が含まれていないことを確認して。" },
    { name: "フランス語", code: "fr", prompt: "このバナー広告画像をフランス語に変更して。変換後に日本語が含まれていないことを確認して。" },
    { name: "アラビア語", code: "ar", prompt: "このバナー広告画像をアラビア語に変更して。変換後に日本語が含まれていないことを確認して。" }
  ];

  // const modelName = "gemini-2.5-flash-image";
  const modelName = "gemini-3-pro-image-preview";

  // 各言語に対して処理を実行
  for (const language of languages) {
    console.log(`\n=== ${language.name}への変換開始 ===`);
    
    const prompt = [
      { text: language.prompt },
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Image,
        },
      },
    ];

    // API レイテンシー測定開始
    const startTime = Date.now();
    console.log(`${language.name} - API リクエスト開始...`);

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      // API レイテンシー測定終了
      const endTime = Date.now();
      const latency = endTime - startTime;
      console.log(`${language.name} - API レスポンス受信完了 - レイテンシー: ${latency}ms (${(latency / 1000).toFixed(2)}秒)`);

      if (!response.candidates || response.candidates.length === 0) {
        console.log(`${language.name} - No candidates returned`);
        continue;
      }

      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        console.log(`${language.name} - No content in response`);
        continue;
      }

      for (const part of candidate.content.parts) {
        if (part.text) {
          console.log(`${language.name} - Generated text:`, part.text);
        } else if (part.inlineData && part.inlineData.data) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          
          // ファイル名: model名_言語コード.png
          const filename = `${modelName.replace(/[^a-zA-Z0-9]/g, '-')}_${language.code}.png`;
          fs.writeFileSync(filename, buffer);
          console.log(`${language.name} - Image saved as ${filename}`);
        }
      }

      // 処理完了時間も表示
      const totalTime = Date.now() - startTime;
      console.log(`${language.name} - 処理完了 - 総処理時間: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}秒)`);

    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error(`${language.name} - API エラー発生 - 経過時間: ${errorTime}ms`);
      console.error(`${language.name} - Error:`, error);
    }

    // 次の言語処理前に少し待機（API制限対策）
    if (language !== languages[languages.length - 1]) {
      console.log("次の言語処理まで2秒待機...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

main();
