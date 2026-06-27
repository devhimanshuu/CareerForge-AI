import type { Context, Next } from "hono";

type Bucket = { tokens: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Sliding-window-ish token bucket. In-memory only — fine for local dev
// and a per-instance safety net in serverless. Swap to Upstash Ratelimit
// behind this signature when UPSTASH_REDIS_REST_URL is configured.
export function rateLimit(opts: {
  limit: number;
  windowMs: number;
  keyPrefix?: string;
}) {
  return async (c: Context, next: Next) => {
    const user = (c as any).get?.("user");
    const userId: string | undefined = user?.id;

    const key = `${opts.keyPrefix || "rl"}:${userId || c.req.header("x-forwarded-for") || "anon"}`;
    const now = Date.now();
    const b = buckets.get(key);

    if (!b || b.resetAt < now) {
      buckets.set(key, { tokens: opts.limit - 1, resetAt: now + opts.windowMs });
      return next();
    }
    if (b.tokens <= 0) {
      const retryAfter = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
      c.header("Retry-After", String(retryAfter));
      return c.json(
        { error: "Rate limit exceeded", retryAfter },
        429
      );
    }
    b.tokens -= 1;
    return next();
  };
}

// Periodic GC to avoid unbounded growth.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    buckets.forEach((v, k) => {
      if (v.resetAt < now) buckets.delete(k);
    });
  }, 60_000).unref?.();
}
