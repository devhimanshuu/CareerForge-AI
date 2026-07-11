/**
 * Central LangChain model configuration.
 *
 * Provides a primary ChatModel (NVIDIA NIM-hosted Moonshot Kimi K2) with
 * automatic fallback to Groq (Llama 3.3 70B). All AI features in the app
 * should import from here instead of constructing their own clients.
 *
 * The NVIDIA model id can be overridden via NVIDIA_KIMI_MODEL — the default
 * `moonshotai/kimi-k2-instruct` is the verified ID currently hosted on
 * https://build.nvidia.com (the previous `moonshotai/kimi-k2.6` ID did not
 * exist and silently fell back to Groq).
 */

import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { Runnable } from "@langchain/core/runnables";

// ── Groq (fallback) ──────────────────────────────────────────────────────────
export const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "dummy",
  model: "llama-3.3-70b-versatile",
  temperature: 0.4,
  maxTokens: 4096,
});

// ── NVIDIA NIM via OpenAI-compatible endpoint (primary) ──────────────────────
const NVIDIA_MODEL = process.env.NVIDIA_KIMI_MODEL || "moonshotai/kimi-k2-instruct";
const nvidiaPrimary = new ChatOpenAI({
  apiKey: process.env.NVIDIA_KIMI_KEY || "dummy",
  configuration: {
    baseURL: "https://integrate.api.nvidia.com/v1",
  },
  model: NVIDIA_MODEL,
  temperature: 0.4,
  maxTokens: 4096,
});

// ── Model with automatic fallback ────────────────────────────────────────────
// Subclass Runnable to support both regular chat completions, streaming, structured output
// and piping while handling the NVIDIA -> Groq fallback chain seamlessly.
class FallbackChatModel extends Runnable<any, any> {
  lc_namespace = ["langchain", "schema", "runnable"];

  async invoke(input: any, options?: any) {
    const model =
      process.env.NVIDIA_KIMI_KEY && process.env.NVIDIA_KIMI_KEY !== "dummy"
        ? nvidiaPrimary.withFallbacks({
            fallbacks: [groqModel],
          })
        : groqModel;
    return model.invoke(input, options);
  }

  async stream(input: any, options?: any) {
    const model =
      process.env.NVIDIA_KIMI_KEY && process.env.NVIDIA_KIMI_KEY !== "dummy"
        ? nvidiaPrimary.withFallbacks({
            fallbacks: [groqModel],
          })
        : groqModel;
    return model.stream(input, options);
  }

  withStructuredOutput(schema: any, options?: any) {
    if (process.env.NVIDIA_KIMI_KEY && process.env.NVIDIA_KIMI_KEY !== "dummy") {
      const primary = nvidiaPrimary.withStructuredOutput(schema, options);
      const fallback = groqModel.withStructuredOutput(schema, options);
      return primary.withFallbacks({
        fallbacks: [fallback],
      });
    }
    return groqModel.withStructuredOutput(schema, options);
  }
}

export const chatModel = new FallbackChatModel();

// ── Groq-only model (for when we specifically need Groq, e.g. audio) ─────────
export const groqOnly = groqModel;

// ── Fast model (lower quality, faster response, for validation steps) ────────
export const fastModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "dummy",
  model: "llama-3.1-8b-instant",
  temperature: 0.2,
  maxTokens: 2048,
});
