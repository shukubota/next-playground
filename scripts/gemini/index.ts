
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_AI_API_KEY environment variable is required");
    console.error("Get your API key from https://aistudio.google.com/app/apikey");
    return;
  }
  
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const imagePath = "/Users/shu.kubota/Desktop/banner_original.png";
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const prompt = [
    { text: "Create a picture of my cat eating a nano-banana in a fancy restaurant under the Gemini constellation" },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });
  
  if (!response.candidates || response.candidates.length === 0) {
    console.error("No candidates returned from the API");
    return;
  }

  const candidate = response.candidates[0];
  if (!candidate.content || !candidate.content.parts) {
    console.error("No content or parts in the response");
    return;
  }

  for (const part of candidate.content.parts) {
    if (part.text) {
      console.log("Generated text:", part.text);
    } else if (part.inlineData && part.inlineData.data) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("gemini-generated-image.png", buffer);
      console.log("Image saved as gemini-generated-image.png");
    }
  }
}

main().catch(console.error);
