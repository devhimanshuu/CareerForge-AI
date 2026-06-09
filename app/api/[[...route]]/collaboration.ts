import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { documentTable, reviewCommentTable, collaborationThreadTable } from "@/db/schema";
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
  )
  // ─── Threaded Collaboration Comments ───
  // GET /collaboration/threads/:documentId — Get all threads for a document
  .get(
    "/threads/:documentId",
    zValidator("param", z.object({ documentId: z.string().min(1) })),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const { documentId } = c.req.valid("param");
      const sectionId = c.req.query("sectionId");
      const limit = Math.min(Number(c.req.query("limit") || 50), 100);
      const offset = Number(c.req.query("offset") || 0);

      // Verify user has access to the document
      const document = await db.query.documentTable.findFirst({
        where: and(
          eq(documentTable.documentId, documentId),
          eq(documentTable.userId, user.id)
        ),
      });
      if (!document) return c.json({ error: "Document not found or access denied" }, 404);

      const conditions = [eq(collaborationThreadTable.documentId, documentId)];
      if (sectionId) {
        conditions.push(eq(collaborationThreadTable.sectionId, sectionId));
      }

      const threads = await db
        .select()
        .from(collaborationThreadTable)
        .where(and(...conditions))
        .orderBy(desc(collaborationThreadTable.createdAt))
        .limit(limit)
        .offset(offset);

      return c.json({ success: true, threads });
    },
  )
  // POST /collaboration/threads/:documentId — Create a new comment thread
  .post(
    "/threads/:documentId",
    zValidator("param", z.object({ documentId: z.string().min(1) })),
    zValidator(
      "json",
      z.object({
        id: z.string().min(1).max(255),
        sectionId: z.string().min(1).max(100),
        selectedText: z.string().max(1000).optional(),
        highlightRange: z.object({ start: z.number(), end: z.number() }).optional(),
        authorName: z.string().trim().min(2).max(255),
        authorEmail: z.string().email().optional().or(z.literal("")),
        authorColor: z.string().max(7).optional(),
        content: z.string().trim().min(3).max(2000),
      }),
    ),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const { documentId } = c.req.valid("param");
      const input = c.req.valid("json");

      // Verify the document exists and user has access
      const document = await db.query.documentTable.findFirst({
        where: and(
          eq(documentTable.documentId, documentId),
          eq(documentTable.userId, user.id)
        ),
      });
      if (!document) return c.json({ error: "Document not found or access denied" }, 404);

      const [thread] = await db
        .insert(collaborationThreadTable)
        .values({
          id: input.id,
          documentId,
          sectionId: input.sectionId,
          selectedText: input.selectedText || null,
          highlightRange: input.highlightRange || null,
          authorName: input.authorName,
          authorEmail: input.authorEmail || null,
          authorColor: input.authorColor || "#6366f1",
          content: input.content,
        })
        .returning();

      return c.json({ success: true, thread }, 201);
    },
  )
  // PATCH /collaboration/threads/:threadId/reply — Add reply to thread
  .patch(
    "/threads/:threadId/reply",
    zValidator("param", z.object({ threadId: z.string().min(1) })),
    zValidator(
      "json",
      z.object({
        author: z.object({
          name: z.string().min(2).max(255),
          avatar: z.string().optional(),
          color: z.string().max(7).optional(),
        }),
        content: z.string().trim().min(1).max(2000),
      }),
    ),
    getAuthUser,
    async (c) => {
      const { threadId } = c.req.valid("param");
      const input = c.req.valid("json");
      const user = c.get("user");

      // Verify thread exists and user has access to the document
      const thread = await db.query.collaborationThreadTable.findFirst({
        where: eq(collaborationThreadTable.id, threadId),
      });
      if (!thread) return c.json({ error: "Thread not found" }, 404);

      const document = await db.query.documentTable.findFirst({
        where: and(
          eq(documentTable.documentId, thread.documentId),
          eq(documentTable.userId, user.id)
        ),
      });
      if (!document) return c.json({ error: "Access denied" }, 403);

      // Validate and create reply structure
      const reply = {
        author: {
          name: input.author.name,
          avatar: input.author.avatar || null,
          color: input.author.color || "#6366f1",
        },
        content: input.content,
        createdAt: new Date().toISOString(),
      };

      const [updated] = await db
        .update(collaborationThreadTable)
        .set({
          replies: sql`array_append(${collaborationThreadTable.replies}, ${JSON.stringify(reply)})`,
        })
        .where(eq(collaborationThreadTable.id, threadId))
        .returning();

      return c.json({ success: true, thread: updated });
    },
  )
  // PATCH /collaboration/threads/:threadId/resolve — Resolve/unresolve thread
  .patch(
    "/threads/:threadId/resolve",
    zValidator("param", z.object({ threadId: z.string().min(1) })),
    zValidator(
      "json",
      z.object({
        resolved: z.boolean(),
      }),
    ),
    getAuthUser,
    async (c) => {
      const { threadId } = c.req.valid("param");
      const { resolved } = c.req.valid("json");

      const [existing] = await db
        .select({ id: collaborationThreadTable.id })
        .from(collaborationThreadTable)
        .where(eq(collaborationThreadTable.id, threadId))
        .limit(1);
      if (!existing) return c.json({ error: "Thread not found" }, 404);

      const updates = {
        resolved,
        resolvedAt: resolved ? new Date().toISOString() : null,
      };

      const [updated] = await db
        .update(collaborationThreadTable)
        .set(updates)
        .where(eq(collaborationThreadTable.id, threadId))
        .returning();

      return c.json({ success: true, thread: updated });
    },
  )
  // DELETE /collaboration/threads/:threadId — Delete thread
  .delete(
    "/threads/:threadId",
    zValidator("param", z.object({ threadId: z.string().min(1) })),
    getAuthUser,
    async (c) => {
      const { threadId } = c.req.valid("param");

      const [existing] = await db
        .select({ id: collaborationThreadTable.id })
        .from(collaborationThreadTable)
        .where(eq(collaborationThreadTable.id, threadId))
        .limit(1);
      if (!existing) return c.json({ error: "Thread not found" }, 404);

      await db
        .delete(collaborationThreadTable)
        .where(eq(collaborationThreadTable.id, threadId));

      return c.json({ success: true });
    },
  );

export default collaborationRoute;
