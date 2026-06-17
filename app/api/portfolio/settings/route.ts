import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { documentTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, customDomain, analyticsId, template, slug } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const doc = await db.query.documentTable.findFirst({
      where: and(eq(documentTable.userId, userId), eq(documentTable.documentId, documentId)),
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    await db
      .update(documentTable)
      .set({
        customDomain: customDomain !== undefined ? customDomain : doc.customDomain,
        analyticsId: analyticsId !== undefined ? analyticsId : doc.analyticsId,
        template: template !== undefined ? template : doc.template,
        slug: slug !== undefined ? slug : doc.slug,
        status: "public", // Ensure it is public if setting up a portfolio
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documentTable.documentId, documentId));

    return NextResponse.json({ success: true, message: "Portfolio settings updated" });
  } catch (error: any) {
    console.error("[Portfolio Settings API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
