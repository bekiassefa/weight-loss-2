import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

// We define the API key separately and cast it to 'any' to stop the TypeScript error
const apiKey = (import.meta as unknown as any).env.VITE_GEMINI_API_KEY;

// Initialize the AI with the key
const ai = new GoogleGenAI({ apiKey: apiKey });

export const getHealthAdvice = async (
  query: string,
  language: Language,
  contextData: string
): Promise<string> => {
  try {
    const langInstruction =
      language === Language.AMHARIC
        ? "Answer in Amharic (Ethiopian language). Be encouraging and supportive like a kind doctor."
        : "Answer in English. Be encouraging and supportive like a kind doctor.";

    const systemInstruction = `
      You are Doctor JD, a supportive weight loss coach for women in Ethiopia.
      ${langInstruction}
      Keep answers concise (under 100 words) and practical.
      Context about the user: ${contextData}
    `;

    // Using the flash model
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    // FIX: Use 'response.text' directly (no parentheses)
    const responseText = response.text || "I'm here to support you.";
    return responseText as string;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === Language.AMHARIC
      ? "ይቅርታ፣ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።"
      : "Sorry, I encountered an issue. Please try again.";
  }
};
