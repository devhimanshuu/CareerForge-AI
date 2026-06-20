import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/db";
import { usageEventTable } from "@/db/schema";

export const dynamic = "force-dynamic";

const schema = z.object({
  featureId: z.string().min(1).max(100),
  action: z.string().min(1).max(50),
  variant: z.string().max(50).optional(),
  funnel: z.string().max(50).optional(),
  durationMs: z.number().int().min(0).max(24 * 60 * 60 * 1000).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await db.insert(usageEventTable).values({
      userId,
      featureId: parsed.data.featureId,
      action: parsed.data.action,
      variant: parsed.data.variant,
      funnel: parsed.data.funnel,
      durationMs: parsed.data.durationMs,
      metadata: parsed.data.metadata as any,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Usage Track Error:", error);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
