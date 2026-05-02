import OpenAI from "openai";

const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true 
});

export const AIChatSession = {
  sendMessage: async (prompt: string) => {
    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0].message.content || "";
    
    return {
      response: {
        text: () => text,
      },
    };
  },
};
