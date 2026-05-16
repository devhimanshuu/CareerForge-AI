import { Hono } from "hono";
import { getAuthUser } from "@/lib/clerk";
import OpenAI from "openai";

const groqApiKey = process.env.GROQ_API_KEY;
const nvidiaApiKey = process.env.NVIDIA_KIMI_KEY;

const nvidiaClient = new OpenAI({
  apiKey: nvidiaApiKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const groqClient = new OpenAI({
  apiKey: groqApiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

const aiRoute = new Hono()
  .post("/chat", getAuthUser, async (c) => {
    try {
      const { prompt } = await c.req.json();
      
      try {
        // Primary: NVIDIA Kimi 2.6
        const response = await nvidiaClient.chat.completions.create({
          model: "moonshotai/kimi-k2.6",
          messages: [{ role: "user", content: prompt }],
        });
        
        return c.json({ text: response.choices[0].message.content || "" });
      } catch (error) {
        console.warn("NVIDIA API failed, falling back to Groq:", error);
        
        // Fallback: Groq Llama 3.3
        const response = await groqClient.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
        });

        return c.json({ text: response.choices[0].message.content || "" });
      }
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });

export default aiRoute;
