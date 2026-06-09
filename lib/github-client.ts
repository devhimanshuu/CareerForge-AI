/**
 * GitHubClient — rate-limit-aware GitHub API wrapper with ETag caching.
 *
 * Features:
 *  - Automatic Bearer token from GITHUB_TOKEN env var
 *  - ETag-based conditional requests (304 = free, doesn't count against rate limit)
 *  - In-memory response cache with 1 h TTL
 *  - Rate-limit monitoring (X-RateLimit-Remaining / X-RateLimit-Reset)
 *  - Graceful degradation when remaining < 10
 *  - Exponential backoff retry on 403 rate-limit responses
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type GitHubRateLimitInfo = {
  remaining: number;
  reset: number; // unix epoch seconds
  limit: number;
};

export type GitHubFetchResult<T> = {
  data: T;
  fromCache: boolean;
  rateLimit: GitHubRateLimitInfo | null;
  rateLimitWarning?: string;
};

/* ------------------------------------------------------------------ */
/*  In-memory ETag + response cache                                    */
/* ------------------------------------------------------------------ */

interface CacheEntry<T> {
  data: T;
  etag: string | null;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const responseCache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(url: string): CacheEntry<T> | null {
  const entry = responseCache.get(url) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(url);
    return null;
  }
  return entry;
}

function setCache<T>(url: string, data: T, etag: string | null) {
  responseCache.set(url, { data, etag, timestamp: Date.now() });
}

/* ------------------------------------------------------------------ */
/*  Rate-limit state                                                   */
/* ------------------------------------------------------------------ */

let rateLimitState: GitHubRateLimitInfo | null = null;

function updateRateLimit(headers: Headers) {
  const remaining = headers.get("X-RateLimit-Remaining");
  const reset = headers.get("X-RateLimit-Reset");
  const limit = headers.get("X-RateLimit-Limit");
  if (remaining && reset && limit) {
    rateLimitState = {
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
      limit: parseInt(limit, 10),
    };
  }
}

function isRateLimitExhausted(): boolean {
  return rateLimitState !== null && rateLimitState.remaining < 10;
}

function rateLimitWarningMessage(): string | undefined {
  if (!rateLimitState) return undefined;
  if (rateLimitState.remaining < 10) {
    const hasToken = !!process.env.GITHUB_TOKEN;
    const resetDate = new Date(rateLimitState.reset * 1000).toISOString();
    return hasToken
      ? `GitHub API rate limit nearly exhausted (${rateLimitState.remaining} remaining, resets at ${resetDate}). Consider spacing out requests.`
      : `GitHub API rate limit nearly exhausted (${rateLimitState.remaining}/60 remaining, resets at ${resetDate}). Set GITHUB_TOKEN env var for 5000 req/hour.`;
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  Exponential backoff helper                                         */
/* ------------------------------------------------------------------ */

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/* ------------------------------------------------------------------ */
/*  GitHubClient                                                       */
/* ------------------------------------------------------------------ */

export class GitHubClient {
  private readonly baseUrl = "https://api.github.com";
  private readonly baseHeaders: Record<string, string>;

  constructor(token?: string) {
    const authToken = token ?? process.env.GITHUB_TOKEN;
    this.baseHeaders = {
      Accept: "application/vnd.github+json",
      "User-Agent": "CareerForgeAI",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };
  }

  /**
   * Fetch a GitHub API endpoint with ETag caching, rate-limit awareness,
   * and automatic retry on 403 rate-limit responses.
   */
  async fetch<T = unknown>(path: string, options?: RequestInit): Promise<GitHubFetchResult<T>> {
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;

    // Graceful degradation: if rate limit is exhausted, return cached data
    if (isRateLimitExhausted()) {
      const cached = getCached<T>(url);
      if (cached) {
        return {
          data: cached.data,
          fromCache: true,
          rateLimit: rateLimitState,
          rateLimitWarning: rateLimitWarningMessage(),
        };
      }
      // No cache available but rate limit is low — still try (last resort)
    }

    // Build headers with ETag if we have a cached entry
    const cached = getCached<T>(url);
    const headers: Record<string, string> = {
      ...this.baseHeaders,
      ...(options?.headers as Record<string, string> | undefined),
    };
    if (cached?.etag) {
      headers["If-None-Match"] = cached.etag;
    }

    // Attempt with retries for 403 rate-limit responses
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 500;
        await sleep(delay);
      }

      let response: Response;
      try {
        response = await fetch(url, { ...options, headers });
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        continue;
      }

      // 304 Not Modified — ETag matched, use cached data (doesn't count against rate limit)
      if (response.status === 304) {
        updateRateLimit(response.headers);
        if (cached) {
          return {
            data: cached.data,
            fromCache: true,
            rateLimit: rateLimitState,
          };
        }
        // No cache somehow, re-fetch without ETag
        const freshHeaders = { ...this.baseHeaders };
        const freshResponse = await fetch(url, { ...options, headers: freshHeaders });
        if (!freshResponse.ok) throw new Error(`GitHub API error: ${freshResponse.status}`);
        updateRateLimit(freshResponse.headers);
        const data = (await freshResponse.json()) as T;
        const etag = freshResponse.headers.get("ETag");
        setCache(url, data, etag);
        return { data, fromCache: false, rateLimit: rateLimitState, rateLimitWarning: rateLimitWarningMessage() };
      }

      updateRateLimit(response.headers);

      // 403 — likely rate limit exceeded; retry with backoff
      if (response.status === 403) {
        const body = await response.text();
        if (body.includes("rate limit") || body.includes("API rate limit")) {
          lastError = new Error(`GitHub rate limit hit: ${body.slice(0, 200)}`);
          // If reset time is known, wait until then (but cap at 60s per retry)
          if (rateLimitState) {
            const waitSeconds = Math.min(rateLimitState.reset - Math.floor(Date.now() / 1000), 60);
            if (waitSeconds > 0) await sleep(waitSeconds * 1000);
          }
          continue;
        }
        throw new Error(`GitHub API forbidden: ${body.slice(0, 200)}`);
      }

      // Other non-OK responses
      if (!response.ok) {
        throw new Error(`GitHub API error ${response.status}: ${await response.text().then((t) => t.slice(0, 200))}`);
      }

      // Success — cache and return
      const data = (await response.json()) as T;
      const etag = response.headers.get("ETag");
      setCache(url, data, etag);
      return { data, fromCache: false, rateLimit: rateLimitState, rateLimitWarning: rateLimitWarningMessage() };
    }

    // All retries exhausted — return cached data if available, otherwise throw
    const fallback = getCached<T>(url);
    if (fallback) {
      return {
        data: fallback.data,
        fromCache: true,
        rateLimit: rateLimitState,
        rateLimitWarning: rateLimitWarningMessage() ?? "GitHub API rate limit reached; serving cached data.",
      };
    }
    throw lastError ?? new Error("GitHub API request failed after retries");
  }

  /** Read the current rate-limit info (null if no GitHub calls made yet). */
  getRateLimitInfo(): GitHubRateLimitInfo | null {
    return rateLimitState;
  }

  /** Clear the in-memory response cache. */
  clearCache(): void {
    responseCache.clear();
  }
}
