import { NextResponse } from "next/server";
import { z } from "zod";
import { trackPortfolioEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

// Simple in-memory rate limiter for analytics tracking
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute per IP
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

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

const trackSchema = z.object({
  documentId: z.string().min(1),
  type: z.enum(["view", "click", "download", "lead", "session"]),
  source: z.string().max(255).optional(),
  durationSeconds: z.number().int().min(0).max(24 * 60 * 60).optional(),
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

    const parsed = trackSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid tracking payload" }, { status: 400 });

    const aggregate = await trackPortfolioEvent({
      documentId: parsed.data.documentId,
      eventType: parsed.data.type,
      request,
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
