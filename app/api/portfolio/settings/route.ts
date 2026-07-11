import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { documentTable } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

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

    if (slug !== undefined && slug) {
      const [slugOwner] = await db
        .select()
        .from(documentTable)
        .where(
          and(
            eq(documentTable.slug, slug),
            ne(documentTable.documentId, documentId)
          )
        )
        .limit(1);

      if (slugOwner) {
        return NextResponse.json({ error: "Portfolio slug is already taken" }, { status: 409 });
      }
    }

    let sanitizedDomain: string | null = null;
    if (customDomain !== undefined) {
      sanitizedDomain = customDomain
        ? customDomain
            .replace(/^(https?:\/\/)?(www\.)?/, "")
            .replace(/\/.*$/, "")
            .toLowerCase()
            .trim()
        : null;

      if (sanitizedDomain) {
        const [domainOwner] = await db
          .select()
          .from(documentTable)
          .where(
            and(
              eq(documentTable.customDomain, sanitizedDomain),
              ne(documentTable.documentId, documentId)
            )
          )
          .limit(1);

        if (domainOwner) {
          return NextResponse.json({ error: "Custom domain is already mapped to another portfolio" }, { status: 409 });
        }
      }
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
        customDomain: customDomain !== undefined ? sanitizedDomain : doc.customDomain,
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
