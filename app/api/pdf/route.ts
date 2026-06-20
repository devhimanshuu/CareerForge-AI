import { NextResponse } from 'next/server';
import { getAuth } from "@clerk/nextjs/server";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { documentTable } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const { documentId } = await request.json();
    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const { userId } = getAuth(request as any);
    const documentData = await db.query.documentTable.findFirst({
      where: userId
        ? or(
            and(eq(documentTable.documentId, documentId), eq(documentTable.userId, userId)),
            and(eq(documentTable.documentId, documentId), eq(documentTable.status, "public"))
          )
        : and(eq(documentTable.documentId, documentId), eq(documentTable.status, "public")),
    });

    if (!documentData) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const baseUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    
    const pdfSecret = process.env.CLERK_SECRET_KEY || "default_secret";
    const url = `${baseUrl}/preview/${documentId}/resume?print=true&pdfSecret=${encodeURIComponent(pdfSecret)}`;

    // Lazy import so puppeteer's Chromium binary isn't bundled into routes
    // that never call it (keeps Vercel cold-start size down).
    const puppeteer = (await import("puppeteer")).default;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Set viewport to A4 dimensions
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2,
    });

    await page.goto(url, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${documentData.title || "resume"}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
