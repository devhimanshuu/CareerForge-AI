import OpenAI from "openai";

const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
const nvidiaApiKey = process.env.NVIDIA_API_KEY || process.env.NEXT_PUBLIC_NVIDIA_API_KEY;

const nvidiaClient = new OpenAI({
  apiKey: nvidiaApiKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
  dangerouslyAllowBrowser: true 
});

const groqClient = new OpenAI({
  apiKey: groqApiKey,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true 
});

export const AIChatSession = {
  sendMessage: async (prompt: string) => {
    try {
      // Primary: NVIDIA Kimi 2.6
      const response = await nvidiaClient.chat.completions.create({
        model: "moonshotai/kimi-k2.6",
        messages: [{ role: "user", content: prompt }],
      });
      
      const text = response.choices[0].message.content || "";
      return {
        response: {
          text: () => text,
        },
      };
    } catch (error) {
      console.warn("NVIDIA API failed, falling back to Groq:", error);
      
      // Fallback: Groq Llama 3.3
      const response = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.choices[0].message.content || "";
      return {
        response: {
          text: () => text,
        },
      };
    }
  },
};
