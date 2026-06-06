import { chatModel } from "./langchain";

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
    try {
      const response = await chatModel.invoke([
        { role: "user", content: prompt }
      ]);
      const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      return {
        response: {
          text: () => text,
        },
      };
    } catch (error) {
      console.error("LangChain AIChatSession failed:", error);
      throw error;
    }
  },
};
