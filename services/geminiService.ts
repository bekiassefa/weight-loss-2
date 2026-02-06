import { Language } from "../types";

export const getHealthAdvice = async (
  query: string,
  language: Language,
  contextData: string
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // We are using the DeepSeek key here now

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat", // or "deepseek-reasoner" for smarter (but slower) answers
        messages: [
          {
            role: "system",
            content: `You are Doctor JD, a supportive weight loss coach. 
            ${language === Language.AMHARIC ? "Answer in Amharic." : "Answer in English."} 
            Keep answers concise and practical. User context: ${contextData}`
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API Error:", errorData);
      throw new Error(`DeepSeek Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("AI Error:", error);
    return language === Language.AMHARIC
      ? "ይቅርታ፣ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።"
      : "Sorry, I encountered an issue. Please try again.";
  }
};
