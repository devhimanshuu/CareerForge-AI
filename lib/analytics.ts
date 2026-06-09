import { createHash } from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { analyticsEventTable, documentTable } from "@/db/schema";

type TrackEventInput = {
  documentId: string;
  eventType: "view" | "click" | "download" | "lead" | "session";
  headers: Headers;
  source?: string | null;
  durationSeconds?: number | null;
};

const getClientIp = (headers: Headers) => {
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
};

const getDevice = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  if (/ipad|tablet/.test(ua)) return "tablet";
  return "desktop";
};

const getCountry = (headers: Headers) => {
  const country =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code");
  if (!country || country === "XX" || country === "T1") return null;
  return country.toUpperCase();
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
  headers,
  source,
  durationSeconds,
}: TrackEventInput) => {
  const [doc] = await db
    .select()
    .from(documentTable)
    .where(and(eq(documentTable.documentId, documentId), eq(documentTable.status, "public")))
    .limit(1);

  if (!doc) return null;

  const userAgent = headers.get("user-agent") || "";
  const visitorHash = createVisitorHash(headers);

  await db.insert(analyticsEventTable).values({
    documentId,
    eventType,
    visitorHash,
    source: source || null,
    referrer: headers.get("referer"),
    userAgent,
    device: getDevice(userAgent),
    country: getCountry(headers),
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
