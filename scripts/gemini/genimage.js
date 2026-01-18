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

  const prompt =
    "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });
    
    if (!response.candidates || response.candidates.length === 0) {
      console.log("No candidates returned");
      return;
    }
    
    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      console.log("No content in response");
      return;
    }
    
    for (const part of candidate.content.parts) {
      if (part.text) {
        console.log("Generated text:", part.text);
      } else if (part.inlineData && part.inlineData.data) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        fs.writeFileSync("generated-image.png", buffer);
        console.log("Image saved as generated-image.png");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
