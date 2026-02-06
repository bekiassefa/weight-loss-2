import { GoogleGenerativeAI } from "@google/generative-ai";
import { Language } from "../types";

// Initialize the SDK with your API Key
// @ts-ignore
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const getHealthAdvice = async (
  query: string,
  language: Language,
  contextData: string
): Promise<string> => {
  try {
    // BASED ON YOUR LIST: "gemini-2.5-flash" is the best free option.
    // If you get a Quota error, change this to "gemini-2.5-flash-lite"
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash" 
    });

    const prompt = `
      You are Doctor JD, a supportive weight loss coach.
      ${language === Language.AMHARIC ? "Answer in Amharic (Ethiopian language)." : "Answer in English."}
      Keep answers concise, encouraging, and practical. 
      User context: ${contextData}
      
      User Question: ${query}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // Fallback error message
    return language === Language.AMHARIC
      ? "ይቅርታ፣ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።"
      : "Sorry, I encountered an issue. Please try again.";
  }
};
