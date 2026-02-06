import { GoogleGenerativeAI } from "@google/generative-ai"; // <--- Standard Import
import { Language } from "../types";

// Initialize the Standard SDK
// @ts-ignore
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const getHealthAdvice = async (
  query: string,
  language: Language,
  contextData: string
): Promise<string> => {
  try {
    // 1. Select the Model (gemini-1.5-flash is perfect here)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-001",
      systemInstruction: {
        role: "system",
        parts: [{ text: `You are Doctor JD, a supportive weight loss coach. 
        ${language === Language.AMHARIC ? "Answer in Amharic." : "Answer in English."} 
        Keep answers concise and practical. User context: ${contextData}` }]
      }
    });

    // 2. Generate Content
    const result = await model.generateContent(query);
    const response = await result.response;
    
    // 3. Return Text
    return response.text();

  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === Language.AMHARIC
      ? "ይቅርታ፣ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።"
      : "Sorry, I encountered an issue. Please try again.";
  }
};
