import { createHash } from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { analyticsEventTable, documentTable } from "@/db/schema";

/* ------------------------------------------------------------------ */
/*  Geo Detection with Fallback Chain & In-Memory LRU Cache          */
/* ------------------------------------------------------------------ */

export type GeoData = {
  country: string;
  city: string;
  countryCode: string;
};

const UNKNOWN_GEO: GeoData = { country: "Unknown", city: "Unknown", countryCode: "XX" };

interface GeoCacheEntry {
  data: GeoData;
  timestamp: number;
}

const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const GEO_CACHE_MAX = 1000;

const geoCache = new Map<string, GeoCacheEntry>();

/** Evict the oldest entry when the cache exceeds capacity (LRU). */
function evictOldestGeoEntry() {
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  geoCache.forEach((entry, key) => {
    if (entry.timestamp < oldestTime) {
      oldestTime = entry.timestamp;
      oldestKey = key;
    }
  });
  if (oldestKey) geoCache.delete(oldestKey);
}

/** Prune expired entries & enforce max-size limit. */
function pruneGeoCache() {
  const now = Date.now();
  const expiredKeys: string[] = [];
  geoCache.forEach((entry, key) => {
    if (now - entry.timestamp > GEO_CACHE_TTL_MS) expiredKeys.push(key);
  });
  for (const key of expiredKeys) geoCache.delete(key);
  while (geoCache.size > GEO_CACHE_MAX) evictOldestGeoEntry();
}

/** Resolve geo data for an incoming request with a 4-tier fallback chain. */
export async function getGeoData(request: Request): Promise<GeoData> {
  const headers = request.headers;

  // Priority 1: Vercel deployment header
  const vercelCountry = headers.get("x-vercel-ip-country");
  if (vercelCountry && vercelCountry !== "XX" && vercelCountry !== "T1") {
    return { country: vercelCountry.toUpperCase(), city: "Unknown", countryCode: vercelCountry.toUpperCase() };
  }

  // Priority 2: Cloudflare header
  const cfCountry = headers.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX" && cfCountry !== "T1") {
    return { country: cfCountry.toUpperCase(), city: "Unknown", countryCode: cfCountry.toUpperCase() };
  }

  // Priority 3: Free ip-api.com lookup (45 req/min, no key needed)
  const ip = getClientIp(headers);
  if (ip && ip !== "unknown") {
    pruneGeoCache();
    const cached = geoCache.get(ip);
    if (cached && Date.now() - cached.timestamp <= GEO_CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=country,city,countryCode`,
        { signal: AbortSignal.timeout(3000) },
      );
      if (res.ok) {
        const body = await res.json() as { country?: string; city?: string; countryCode?: string };
        const data: GeoData = {
          country: body.country || "Unknown",
          city: body.city || "Unknown",
          countryCode: body.countryCode || "XX",
        };
        if (geoCache.size >= GEO_CACHE_MAX) pruneGeoCache();
        geoCache.set(ip, { data, timestamp: Date.now() });
        return data;
      }
    } catch {
      // ip-api unavailable or timed out — fall through
    }
  }

  // Priority 4: Unknown fallback
  return { ...UNKNOWN_GEO };
}

type TrackEventInput = {
  documentId: string;
  eventType: "view" | "click" | "download" | "lead" | "session";
  request: Request;
  source?: string | null;
  durationSeconds?: number | null;
};

const getClientIp = (headers: Headers): string => {
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
};

const getDevice = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  if (/ipad|tablet/.test(ua)) return "tablet";
  return "desktop";
};

export const createVisitorHash = (headers: Headers) => {
  const ip = getClientIp(headers);
  const userAgent = headers.get("user-agent") || "unknown";
  const salt = process.env.ANALYTICS_SALT || process.env.CLERK_SECRET_KEY || "careerforge";
  return createHash("sha256").update(`${ip}:${userAgent}:${salt}`).digest("hex");
};

export const trackPortfolioEvent = async ({
  documentId,
  eventType,
  request,
  source,
  durationSeconds,
}: TrackEventInput) => {
  const headers = request.headers;

  const [doc] = await db
    .select()
    .from(documentTable)
    .where(and(eq(documentTable.documentId, documentId), eq(documentTable.status, "public")))
    .limit(1);

  if (!doc) return null;

  const userAgent = headers.get("user-agent") || "";
  const visitorHash = createVisitorHash(headers);

  const geo = await getGeoData(request);

  await db.insert(analyticsEventTable).values({
    documentId,
    eventType,
    visitorHash,
    source: source || null,
    referrer: headers.get("referer"),
    userAgent,
    device: getDevice(userAgent),
    country: geo.country === "Unknown" ? null : geo.country,
    durationSeconds: durationSeconds ?? null,
  });

  const [aggregate] = await db
    .select({
      views: sql<number>`count(*) filter (where ${analyticsEventTable.eventType} = 'view')::int`,
      uniqueVisitors: sql<number>`count(distinct ${analyticsEventTable.visitorHash})::int`,
      clickThroughs: sql<number>`count(*) filter (where ${analyticsEventTable.eventType} in ('click', 'download', 'lead'))::int`,
    })
    .from(analyticsEventTable)
    .where(eq(analyticsEventTable.documentId, documentId));

  await db
    .update(documentTable)
    .set({
      views: aggregate?.views || 0,
      uniqueVisitors: aggregate?.uniqueVisitors || 0,
      clickThroughs: aggregate?.clickThroughs || 0,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(documentTable.documentId, documentId));

  return aggregate;
};
