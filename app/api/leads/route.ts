import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { documentTable, portfolioLeadTable } from "@/db/schema";
import { trackPortfolioEvent } from "@/lib/analytics";
import { notificationService } from "@/lib/notifications";

// Simple in-memory rate limiter for lead capture
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per hour per IP for lead capture
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

const leadSchema = z.object({
  documentId: z.string().min(1),
  email: z.string().email(),
  linkedin: z.string().url().optional().or(z.literal("")),
  message: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limiting based on IP
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

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

    try {
      const email = parsed.data.email;
      const msg = parsed.data.message ? ` Message: "${parsed.data.message}"` : "";
      await notificationService.notify(doc.userId, {
        type: "insight_generated",
        title: "New Recruiter Lead Captured! 🎯",
        body: `A recruiter (${email}) has connected with you on your portfolio.${msg}`,
        email: doc.authorEmail || undefined,
        metadata: { documentId: doc.documentId },
      });
    } catch (notificationError) {
      console.error("Failed to notify user about new lead:", notificationError);
    }

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
