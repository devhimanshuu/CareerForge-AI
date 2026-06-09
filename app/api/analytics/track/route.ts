import { NextResponse } from "next/server";
import { z } from "zod";
import { trackPortfolioEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const trackSchema = z.object({
  documentId: z.string().min(1),
  type: z.enum(["view", "click", "download", "lead", "session"]),
  source: z.string().max(255).optional(),
  durationSeconds: z.number().int().min(0).max(24 * 60 * 60).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = trackSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid tracking payload" }, { status: 400 });

    const aggregate = await trackPortfolioEvent({
      documentId: parsed.data.documentId,
      eventType: parsed.data.type,
      headers: request.headers,
      source: parsed.data.source,
      durationSeconds: parsed.data.durationSeconds,
    });

    if (!aggregate) return NextResponse.json({ error: "Document not found or private" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking Error:", error);
    return NextResponse.json({ error: "Failed to track analytics" }, { status: 500 });
  }
}
