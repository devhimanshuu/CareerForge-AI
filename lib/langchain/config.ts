/**
 * Central LangChain model configuration.
 *
 * Provides a primary ChatModel (NVIDIA Kimi K2.6) with automatic fallback
 * to Groq (Llama 3.3 70B). All AI features in the app should import from
 * here instead of constructing their own clients.
 */

import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";

// ── Groq (fallback) ──────────────────────────────────────────────────────────
export const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "dummy",
  model: "llama-3.3-70b-versatile",
  temperature: 0.4,
  maxTokens: 4096,
});

// ── NVIDIA NIM via OpenAI-compatible endpoint (primary) ──────────────────────
const nvidiaPrimary = new ChatOpenAI({
  apiKey: process.env.NVIDIA_KIMI_KEY || "dummy",
  openAIApiKey: process.env.NVIDIA_KIMI_KEY || "dummy",
  configuration: {
    baseURL: "https://integrate.api.nvidia.com/v1",
  },
  modelName: "moonshotai/kimi-k2.6",
  temperature: 0.4,
  maxTokens: 4096,
});

// ── Model with automatic fallback ────────────────────────────────────────────
// Wrapper to support both regular chat completions and structured output
// while handling the NVIDIA -> Groq fallback chain seamlessly.
export const chatModel = {
  invoke: async (input: any, options?: any) => {
    const model =
      process.env.NVIDIA_KIMI_KEY && process.env.NVIDIA_KIMI_KEY !== "dummy"
        ? nvidiaPrimary.withFallbacks({
            fallbacks: [groqModel],
          })
        : groqModel;
    return model.invoke(input, options);
  },
  withStructuredOutput: (schema: any, options?: any) => {
    if (process.env.NVIDIA_KIMI_KEY && process.env.NVIDIA_KIMI_KEY !== "dummy") {
      const primary = nvidiaPrimary.withStructuredOutput(schema, options);
      const fallback = groqModel.withStructuredOutput(schema, options);
      return primary.withFallbacks({
        fallbacks: [fallback],
      });
    }
    return groqModel.withStructuredOutput(schema, options);
  },
} as any;

// ── Groq-only model (for when we specifically need Groq, e.g. audio) ─────────
export const groqOnly = groqModel;

// ── Fast model (lower quality, faster response, for validation steps) ────────
export const fastModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "dummy",
  model: "llama-3.1-8b-instant",
  temperature: 0.2,
  maxTokens: 2048,
});
