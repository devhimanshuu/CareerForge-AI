import { NextResponse } from "next/server";
import { db } from "@/db";
import { documentTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { documentId, type } = await request.json();
    if (!documentId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const doc = await db.query.documentTable.findFirst({
      where: eq(documentTable.documentId, documentId),
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (type === "view") {
      await db.update(documentTable)
        .set({ 
          views: (doc.views || 0) + 1,
          uniqueVisitors: (doc.uniqueVisitors || 0) + (Math.random() > 0.3 ? 1 : 0) // rough estimation for demo
        })
        .where(eq(documentTable.documentId, documentId));
    } else if (type === "click") {
      await db.update(documentTable)
        .set({ clickThroughs: (doc.clickThroughs || 0) + 1 })
        .where(eq(documentTable.documentId, documentId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking Error:", error);
    return NextResponse.json({ error: "Failed to track analytics" }, { status: 500 });
  }
}
