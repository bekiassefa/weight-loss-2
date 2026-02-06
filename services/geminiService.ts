import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

// FIX 1: Change process.env to import.meta.env
// FIX 2: Use the VITE_ variable name
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const getHealthAdvice = async (
  query: string,
  language: Language,
  contextData: string,
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

    // FIX 3: 'gemini-3' does not exist yet. Switched to a valid model name.
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", // Or 'gemini-1.5-flash'
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "I'm here to support you. Please try asking again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === Language.AMHARIC
      ? "ይቅርታ፣ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።"
      : "Sorry, I encountered an issue. Please try again.";
  }
};
