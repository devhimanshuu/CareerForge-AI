import "@/lib/polyfill";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  notificationTable,
  pushSubscriptionTable,
  notificationPreferenceTable,
} from "@/db/schema";
import { getAuthUser } from "@/lib/clerk";
import { notificationService } from "@/lib/notifications";

const notificationRoute = new Hono()

  // ─── Push Subscription ───

  // POST /notification/subscribe — Save push subscription for authenticated user
  .post(
    "/subscribe",
    zValidator(
      "json",
      z.object({
        endpoint: z.string().url(),
        keys: z.object({
          p256dh: z.string().min(1),
          auth: z.string().min(1),
        }),
      })
    ),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const { endpoint, keys } = c.req.valid("json");

      // Upsert: delete existing for this endpoint, then insert
      await db
        .delete(pushSubscriptionTable)
        .where(eq(pushSubscriptionTable.endpoint, endpoint));

      await db.insert(pushSubscriptionTable).values({
        userId: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });

      return c.json({ success: true });
    }
  )

  // DELETE /notification/subscribe — Remove push subscription
  .delete("/subscribe", getAuthUser, async (c) => {
    const user = c.get("user");
    await db
      .delete(pushSubscriptionTable)
      .where(eq(pushSubscriptionTable.userId, user.id));

    return c.json({ success: true });
  })

  // ─── Notifications CRUD ───

  // POST /notification/send — Trigger a notification (used by other API routes)
  .post(
    "/send",
    zValidator(
      "json",
      z.object({
        userId: z.string().min(1),
        type: z.enum([
          "collaboration_comment",
          "interview_score",
          "insight_generated",
          "job_match",
        ]),
        title: z.string().min(1).max(255),
        body: z.string().min(1),
        metadata: z.record(z.any()).optional(),
        email: z.string().email().optional(),
      })
    ),
    getAuthUser,
    async (c) => {
      const input = c.req.valid("json");
      await notificationService.notify(input.userId, {
        type: input.type,
        title: input.title,
        body: input.body,
        metadata: input.metadata,
        email: input.email,
      });
      return c.json({ success: true }, 201);
    }
  )

  // GET /notification — Get user's notifications (paginated, with unread count)
  .get("/", getAuthUser, async (c) => {
    const user = c.get("user");
    const limit = Number(c.req.query("limit") || 20);
    const offset = Number(c.req.query("offset") || 0);

    const [notifications, unreadResult] = await Promise.all([
      db
        .select()
        .from(notificationTable)
        .where(eq(notificationTable.userId, user.id))
        .orderBy(desc(notificationTable.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(notificationTable)
        .where(
          and(
            eq(notificationTable.userId, user.id),
            eq(notificationTable.read, false)
          )
        ),
    ]);

    const unreadCount = unreadResult[0]?.count ?? 0;

    return c.json({ success: true, notifications, unreadCount });
  })

  // PATCH /notification/read — Mark notification(s) as read
  .patch(
    "/read",
    zValidator(
      "json",
      z.object({
        ids: z.array(z.number().int().positive()).optional(),
        all: z.boolean().optional(),
      })
    ),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const { ids, all } = c.req.valid("json");

      if (all) {
        await db
          .update(notificationTable)
          .set({ read: true })
          .where(
            and(
              eq(notificationTable.userId, user.id),
              eq(notificationTable.read, false)
            )
          );
      } else if (ids && ids.length > 0) {
        await db
          .update(notificationTable)
          .set({ read: true })
          .where(
            and(
              eq(notificationTable.userId, user.id),
              sql`${notificationTable.id} IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`
            )
          );
      }

      return c.json({ success: true });
    }
  )

  // ─── Preferences ───

  // GET /notification/preferences — Get user's notification preferences
  .get("/preferences", getAuthUser, async (c) => {
    const user = c.get("user");

    const [prefs] = await db
      .select()
      .from(notificationPreferenceTable)
      .where(eq(notificationPreferenceTable.userId, user.id))
      .limit(1);

    // Return defaults if no preferences exist yet
    if (!prefs) {
      return c.json({
        success: true,
        preferences: {
          pushEnabled: true,
          emailEnabled: true,
          collaborationAlerts: true,
          interviewAlerts: true,
          insightAlerts: true,
          jobMatchAlerts: true,
        },
      });
    }

    return c.json({ success: true, preferences: prefs });
  })

  // PATCH /notification/preferences — Update preferences
  .patch(
    "/preferences",
    zValidator(
      "json",
      z.object({
        pushEnabled: z.boolean().optional(),
        emailEnabled: z.boolean().optional(),
        collaborationAlerts: z.boolean().optional(),
        interviewAlerts: z.boolean().optional(),
        insightAlerts: z.boolean().optional(),
        jobMatchAlerts: z.boolean().optional(),
      })
    ),
    getAuthUser,
    async (c) => {
      const user = c.get("user");
      const updates = c.req.valid("json");

      // Check if preferences exist
      const [existing] = await db
        .select({ id: notificationPreferenceTable.id })
        .from(notificationPreferenceTable)
        .where(eq(notificationPreferenceTable.userId, user.id))
        .limit(1);

      if (existing) {
        await db
          .update(notificationPreferenceTable)
          .set(updates)
          .where(eq(notificationPreferenceTable.userId, user.id));
      } else {
        await db.insert(notificationPreferenceTable).values({
          userId: user.id,
          ...updates,
        });
      }

      return c.json({ success: true });
    }
  )

  // GET /notification/vapid-public-key — Return VAPID public key for client
  .get("/vapid-public-key", async (c) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    if (!publicKey) {
      return c.json({ error: "VAPID public key not configured" }, 503);
    }
    return c.json({ success: true, publicKey });
  });

export default notificationRoute;
