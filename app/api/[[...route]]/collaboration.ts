import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { documentTable, reviewCommentTable } from "@/db/schema";
import { getAuthUser } from "@/lib/clerk";

const collaborationRoute = new Hono()
  .get(
    "/public/:documentId",
    zValidator("param", z.object({ documentId: z.string().min(1) })),
    async (c) => {
      const { documentId } = c.req.valid("param");
      const document = await db.query.documentTable.findFirst({
        where: and(eq(documentTable.documentId, documentId), eq(documentTable.status, "public")),
      });
      if (!document) return c.json({ error: "Portfolio not found" }, 404);

      const comments = await db
        .select({
          id: reviewCommentTable.id,
          sectionId: reviewCommentTable.sectionId,
          selectedText: reviewCommentTable.selectedText,
          reviewerName: reviewCommentTable.reviewerName,
          content: reviewCommentTable.content,
          status: reviewCommentTable.status,
          ownerReply: reviewCommentTable.ownerReply,
          ownerRepliedAt: reviewCommentTable.ownerRepliedAt,
          createdAt: reviewCommentTable.createdAt,
        })
        .from(reviewCommentTable)
        .where(eq(reviewCommentTable.documentId, documentId))
        .orderBy(desc(reviewCommentTable.createdAt));

      return c.json({ success: true, comments });
    },
  )
  .post(
    "/public/:documentId",
    zValidator("param", z.object({ documentId: z.string().min(1) })),
    zValidator(
      "json",
      z.object({
        sectionId: z.enum(["summary", "experience", "skills", "education", "portfolio"]),
        selectedText: z.string().max(1000).optional(),
        reviewerName: z.string().trim().min(2).max(120),
        reviewerEmail: z.string().email().optional().or(z.literal("")),
        content: z.string().trim().min(3).max(2000),
      }),
    ),
    async (c) => {
      const { documentId } = c.req.valid("param");
      const input = c.req.valid("json");
      const document = await db.query.documentTable.findFirst({
        where: and(eq(documentTable.documentId, documentId), eq(documentTable.status, "public")),
      });
      if (!document) return c.json({ error: "Portfolio not found" }, 404);

      const [comment] = await db
        .insert(reviewCommentTable)
        .values({
          documentId,
          ...input,
          reviewerEmail: input.reviewerEmail || null,
        })
        .returning();

      return c.json({ success: true, comment }, 201);
    },
  )
  .get("/all", getAuthUser, async (c) => {
    const user = c.get("user");
    const comments = await db
      .select({
        id: reviewCommentTable.id,
        documentId: reviewCommentTable.documentId,
        sectionId: reviewCommentTable.sectionId,
        selectedText: reviewCommentTable.selectedText,
        reviewerName: reviewCommentTable.reviewerName,
        reviewerEmail: reviewCommentTable.reviewerEmail,
        content: reviewCommentTable.content,
        status: reviewCommentTable.status,
        ownerReply: reviewCommentTable.ownerReply,
        ownerRepliedAt: reviewCommentTable.ownerRepliedAt,
        createdAt: reviewCommentTable.createdAt,
        documentTitle: documentTable.title,
      })
      .from(reviewCommentTable)
      .innerJoin(documentTable, eq(reviewCommentTable.documentId, documentTable.documentId))
      .where(eq(documentTable.userId, user.id))
      .orderBy(desc(reviewCommentTable.createdAt));

    return c.json({ success: true, comments });
  })
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    zValidator(
      "json",
      z.object({
        status: z.enum(["open", "resolved", "dismissed"]).optional(),
        ownerReply: z.string().trim().min(1).max(2000).optional(),
      }),
    ),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");
      const [comment] = await db
        .select({ id: reviewCommentTable.id })
        .from(reviewCommentTable)
        .innerJoin(documentTable, eq(reviewCommentTable.documentId, documentTable.documentId))
        .where(and(eq(reviewCommentTable.id, id), eq(documentTable.userId, user.id)))
        .limit(1);
      if (!comment) return c.json({ error: "Comment not found" }, 404);

      const updates: Record<string, string | null> = {};
      if (body.status) {
        updates.status = body.status;
        updates.resolvedAt = body.status === "resolved" ? new Date().toISOString() : null;
      }
      if (body.ownerReply) {
        updates.ownerReply = body.ownerReply;
        updates.ownerRepliedAt = new Date().toISOString();
      }

      const [updated] = await db
        .update(reviewCommentTable)
        .set(updates)
        .where(eq(reviewCommentTable.id, id))
        .returning();
      return c.json({ success: true, comment: updated });
    },
  )
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const { id } = c.req.valid("param");
      const [comment] = await db
        .select({ id: reviewCommentTable.id })
        .from(reviewCommentTable)
        .innerJoin(documentTable, eq(reviewCommentTable.documentId, documentTable.documentId))
        .where(and(eq(reviewCommentTable.id, id), eq(documentTable.userId, user.id)))
        .limit(1);
      if (!comment) return c.json({ error: "Comment not found" }, 404);

      await db.delete(reviewCommentTable).where(eq(reviewCommentTable.id, id));
      return c.json({ success: true });
    },
  );

export default collaborationRoute;
