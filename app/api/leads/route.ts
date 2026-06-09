import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { documentTable, portfolioLeadTable } from "@/db/schema";
import { trackPortfolioEvent } from "@/lib/analytics";

const leadSchema = z.object({
  documentId: z.string().min(1),
  email: z.string().email(),
  linkedin: z.string().url().optional().or(z.literal("")),
  message: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = leadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid lead payload" }, { status: 400 });
    }

    const [doc] = await db
      .select()
      .from(documentTable)
      .where(
        and(
          eq(documentTable.documentId, parsed.data.documentId),
          eq(documentTable.status, "public")
        )
      )
      .limit(1);

    if (!doc) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    await db.insert(portfolioLeadTable).values({
      documentId: parsed.data.documentId,
      email: parsed.data.email,
      linkedin: parsed.data.linkedin || null,
      message: parsed.data.message || null,
    });

    await trackPortfolioEvent({
      documentId: parsed.data.documentId,
      eventType: "lead",
      request,
      source: "portfolio-chatbot",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead Capture Error:", error);
    return NextResponse.json({ error: "Failed to capture lead" }, { status: 500 });
  }
}
