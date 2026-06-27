import "@/lib/polyfill";

import { Hono } from "hono";
import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";
import documentRoute from "./document";
import applicationRoute from "./application";
import audioRoute from "./audio";
import extractRoute from "./extract";
import imageRoute from "./image";
import aiRoute from "./ai";
import collaborationRoute from "./collaboration";
import automationRoute from "./automation";
import notificationRoute from "./notification";
import { rateLimit } from "@/lib/rate-limit";




export const runtime = "nodejs";

const app = new Hono();

app.use("*", logger());

// Reject oversized JSON payloads to mitigate DoS. Routes that legitimately
// accept large bodies (file uploads under /extract, audio under /audio) are
// exempt — they enforce per-route limits via their own schemas / multipart.
const MAX_BODY_BYTES = 1 * 1024 * 1024; // 1 MB
const LARGE_BODY_PATHS = ["/api/extract", "/api/audio"];
app.use("*", async (c, next) => {
  const path = c.req.path;
  if (LARGE_BODY_PATHS.some((p) => path.startsWith(p))) return next();
  const lenHeader = c.req.header("content-length");
  if (lenHeader && Number(lenHeader) > MAX_BODY_BYTES) {
    return c.json({ error: "Payload too large" }, 413);
  }
  return next();
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error("Unhandled API error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// Rate limits — cap LLM-heavy routes per user/IP. Tunable via env.
// Registered on the base app (not the route chain) so they don't bloat
// Hono RPC type inference.
const aiLimit = Number(process.env.AI_RATE_LIMIT_PER_MIN) || 30;
const automationLimit = Number(process.env.AUTOMATION_RATE_LIMIT_PER_MIN) || 10;
const extractLimit = Number(process.env.EXTRACT_RATE_LIMIT_PER_MIN) || 10;
const audioLimit = Number(process.env.AUDIO_RATE_LIMIT_PER_MIN) || 15;

app.use("/api/ai/*", rateLimit({ limit: aiLimit, windowMs: 60_000, keyPrefix: "ai" }));
app.use("/api/automation/*", rateLimit({ limit: automationLimit, windowMs: 60_000, keyPrefix: "automation" }));
app.use("/api/extract/*", rateLimit({ limit: extractLimit, windowMs: 60_000, keyPrefix: "extract" }));
app.use("/api/audio/*", rateLimit({ limit: audioLimit, windowMs: 60_000, keyPrefix: "audio" }));

const routes = app
  .basePath("/api")
  .route("/document", documentRoute)
  .route("/application", applicationRoute)
  .route("/audio", audioRoute)
  .route("/extract", extractRoute)
  .route("/image", imageRoute)
  .route("/ai", aiRoute)
  .route("/collaboration", collaborationRoute)
  .route("/automation", automationRoute)
  .route("/notification", notificationRoute);




app.get("/", (c) => {
  return c.json({
    message: "Hello from Ai Resume!",
  });
});

export type AppType = typeof routes;

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

