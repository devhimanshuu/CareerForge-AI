import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { usageEventTable } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const days = Math.max(1, Math.min(90, parseInt(url.searchParams.get("days") || "30")));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const scope = url.searchParams.get("scope") === "self" ? "self" : "all";

    const baseWhere = scope === "self"
      ? and(eq(usageEventTable.userId, userId), gte(usageEventTable.createdAt, since))
      : gte(usageEventTable.createdAt, since);

    // Top features by engagement (distinct users × actions).
    const featureLeaderboard = await db
      .select({
        featureId: usageEventTable.featureId,
        events: sql<number>`count(*)::int`,
        users: sql<number>`count(distinct ${usageEventTable.userId})::int`,
        avgDurationMs: sql<number>`coalesce(avg(${usageEventTable.durationMs}), 0)::int`,
      })
      .from(usageEventTable)
      .where(baseWhere)
      .groupBy(usageEventTable.featureId)
      .orderBy(sql`count(*) desc`)
      .limit(15);

    // A/B test funnel — for each (funnel, variant), count exposure/conversion.
    const abFunnel = await db
      .select({
        funnel: usageEventTable.funnel,
        variant: usageEventTable.variant,
        action: usageEventTable.action,
        count: sql<number>`count(*)::int`,
        users: sql<number>`count(distinct ${usageEventTable.userId})::int`,
      })
      .from(usageEventTable)
      .where(
        and(
          baseWhere,
          sql`${usageEventTable.funnel} is not null`,
          sql`${usageEventTable.variant} is not null`
        )
      )
      .groupBy(usageEventTable.funnel, usageEventTable.variant, usageEventTable.action);

    // Pro conversion funnel — ordered steps for the "pro" funnel.
    const proSteps = ["view_pricing", "click_upgrade", "complete_payment"];
    const proRaw = await db
      .select({
        action: usageEventTable.action,
        users: sql<number>`count(distinct ${usageEventTable.userId})::int`,
      })
      .from(usageEventTable)
      .where(
        and(baseWhere, eq(usageEventTable.funnel, "pro"))
      )
      .groupBy(usageEventTable.action);

    const proConversion = proSteps.map((step) => ({
      step,
      users: proRaw.find((r) => r.action === step)?.users || 0,
    }));

    // Reshape A/B funnel into { funnel: { variant: { exposure, conversion } } }.
    const ab: Record<
      string,
      Record<string, { exposure: number; conversion: number; users: number }>
    > = {};
    for (const row of abFunnel) {
      if (!row.funnel || !row.variant) continue;
      ab[row.funnel] = ab[row.funnel] || {};
      ab[row.funnel][row.variant] = ab[row.funnel][row.variant] || {
        exposure: 0,
        conversion: 0,
        users: 0,
      };
      const bucket = ab[row.funnel][row.variant];
      if (row.action === "exposure" || row.action === "view") {
        bucket.exposure += row.count;
      } else if (row.action === "conversion" || row.action === "convert") {
        bucket.conversion += row.count;
      }
      bucket.users = Math.max(bucket.users, row.users);
    }

    return NextResponse.json({
      success: true,
      data: {
        days,
        scope,
        featureLeaderboard,
        abFunnel: ab,
        proConversion,
      },
    });
  } catch (error) {
    console.error("Usage Summary Error:", error);
    return NextResponse.json({ error: "Failed to load usage" }, { status: 500 });
  }
}
