import OpenAI from "openai";

export const AIChatSession = {
  sendMessage: async (prompt: string) => {
    // If running in the browser, call our internal API to keep keys secret
    if (typeof window !== "undefined") {
      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI response");
        }

        const data = await response.json();
        return {
          response: {
            text: () => data.text,
          },
        };
      } catch (error) {
        console.error("Client-side AI error:", error);
        throw error;
      }
    }

    // Server-side logic (runs in API routes or Server Actions)
    const groqApiKey = process.env.GROQ_API_KEY;
    const nvidiaApiKey = process.env.NVIDIA_KIMI_KEY;

    const nvidiaClient = new OpenAI({
      apiKey: nvidiaApiKey || "dummy",
      baseURL: "https://integrate.api.nvidia.com/v1",
    });

    const groqClient = new OpenAI({
      apiKey: groqApiKey || "dummy",
      baseURL: "https://api.groq.com/openai/v1",
    });

    try {
      if (!nvidiaApiKey || nvidiaApiKey === "dummy") throw new Error("Missing NVIDIA API Key");
      
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
      
      if (!groqApiKey || groqApiKey === "dummy") throw new Error("Missing Groq API Key");

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
