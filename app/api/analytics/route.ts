import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { analyticsEventTable, documentTable } from "@/db/schema";
import { and, eq, gte, inArray, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const userDocuments = await db
      .select()
      .from(documentTable)
      .where(eq(documentTable.userId, userId));

    const documentIds = userDocuments.map((doc) => doc.documentId);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const [aggregate] = documentIds.length
      ? await db
          .select({
            totalViews: sql<number>`count(*) filter (where ${analyticsEventTable.eventType} = 'view')::int`,
            uniqueVisitors: sql<number>`count(distinct ${analyticsEventTable.visitorHash})::int`,
            clickThroughs: sql<number>`count(*) filter (where ${analyticsEventTable.eventType} in ('click', 'download', 'lead'))::int`,
            avgDuration: sql<number>`coalesce(avg(${analyticsEventTable.durationSeconds}) filter (where ${analyticsEventTable.durationSeconds} is not null), 0)::int`,
          })
          .from(analyticsEventTable)
          .where(inArray(analyticsEventTable.documentId, documentIds))
      : [{ totalViews: 0, uniqueVisitors: 0, clickThroughs: 0, avgDuration: 0 }];

    const branchMetrics = userDocuments.map(doc => ({
      title: doc.title,
      views: doc.views || 0,
      responses: doc.responses || 0,
      branchName: doc.branchName,
      isBranch: !!doc.parentId,
      documentId: doc.documentId
    })).sort((a, b) => b.views - a.views);

    const viewsByDate = documentIds.length
      ? await db
          .select({
            date: sql<string>`to_char(${analyticsEventTable.createdAt}, 'YYYY-MM-DD')`,
            views: sql<number>`count(*)::int`,
          })
          .from(analyticsEventTable)
          .where(
            and(
              inArray(analyticsEventTable.documentId, documentIds),
              eq(analyticsEventTable.eventType, "view"),
              gte(analyticsEventTable.createdAt, fourteenDaysAgo.toISOString())
            )
          )
          .groupBy(sql`to_char(${analyticsEventTable.createdAt}, 'YYYY-MM-DD')`)
      : [];

    const trafficSources = documentIds.length
      ? await db
          .select({
            label: sql<string>`coalesce(nullif(${analyticsEventTable.source}, ''), nullif(${analyticsEventTable.referrer}, ''), 'Direct')`,
            count: sql<number>`count(*)::int`,
          })
          .from(analyticsEventTable)
          .where(
            and(
              inArray(analyticsEventTable.documentId, documentIds),
              eq(analyticsEventTable.eventType, "view")
            )
          )
          .groupBy(sql`coalesce(nullif(${analyticsEventTable.source}, ''), nullif(${analyticsEventTable.referrer}, ''), 'Direct')`)
          .orderBy(sql`count(*) desc`)
          .limit(5)
      : [];

    const geoBreakdown = documentIds.length
      ? await db
          .select({
            country: analyticsEventTable.country,
            count: sql<number>`count(*)::int`,
          })
          .from(analyticsEventTable)
          .where(
            and(
              inArray(analyticsEventTable.documentId, documentIds),
              eq(analyticsEventTable.eventType, "view"),
            ),
          )
          .groupBy(analyticsEventTable.country)
          .orderBy(sql`count(*) desc`)
          .limit(8)
      : [];

    const avgTime = formatDuration(aggregate?.avgDuration || 0);
    const sourceTotal = trafficSources.reduce((sum, source) => sum + source.count, 0);
    const geoTotal = geoBreakdown.reduce((sum, row) => sum + row.count, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalViews: aggregate?.totalViews || 0,
        uniqueVisitors: aggregate?.uniqueVisitors || 0,
        avgTime,
        clickThroughs: aggregate?.clickThroughs || 0,
        viewsOverTime: buildViewsArray(viewsByDate, fourteenDaysAgo),
        branchMetrics,
        trafficSources: trafficSources.map((source) => ({
          label: normalizeSourceLabel(source.label),
          percentage: sourceTotal ? Math.round((source.count / sourceTotal) * 100) : 0,
        })),
        geoBreakdown: geoBreakdown.map((row) => ({
          country: row.country || "Unknown",
          percentage: geoTotal ? Math.round((row.count / geoTotal) * 100) : 0,
          count: row.count,
        })),
      },
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

function buildViewsArray(rows: { date: string; views: number }[], startDate: Date) {
  const byDate = new Map(rows.map((row) => [row.date, row.views]));
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return byDate.get(date.toISOString().slice(0, 10)) || 0;
  });
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}m ${safeSeconds % 60}s`;
}

function normalizeSourceLabel(source: string) {
  if (source === "public-portfolio") return "Portfolio Page";
  if (source === "portfolio") return "Portfolio Download";
  if (source === "Direct") return "Direct";

  try {
    const url = new URL(source);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return source;
  }
}
