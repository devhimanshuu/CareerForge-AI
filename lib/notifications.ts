import webpush from "web-push";
import nodemailer from "nodemailer";
import { db } from "@/db";
import {
  notificationTable,
  pushSubscriptionTable,
  notificationPreferenceTable,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

// ─── VAPID Configuration ───
let vapidKeysConfigured = false;

function configureVapid() {
  if (vapidKeysConfigured) return;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@careerforge.ai";

  if (!publicKey || !privateKey) {
    // Auto-generate keys on first run and log them
    const keys = webpush.generateVAPIDKeys();
    console.warn(
      "[NotificationService] VAPID keys not found in env. Generated new keys — add these to your .env:\n" +
        `VAPID_PUBLIC_KEY=${keys.publicKey}\n` +
        `VAPID_PRIVATE_KEY=${keys.privateKey}\n` +
        `VAPID_SUBJECT=${subject}`
    );
    webpush.setVapidDetails(subject, keys.publicKey, keys.privateKey);
  } else {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  }

  vapidKeysConfigured = true;
}

// ─── Types ───
export type NotificationEvent = {
  type: "collaboration_comment" | "interview_score" | "insight_generated" | "job_match";
  title: string;
  body: string;
  metadata?: Record<string, any>;
  email?: string; // recipient email for email channel
};

// ─── Notification Service ───
export class NotificationService {
  /**
   * Send a web push notification to all subscriptions for a user
   */
  async sendPush(
    userId: string,
    payload: { title: string; body: string; icon?: string; url?: string }
  ): Promise<void> {
    configureVapid();

    const subscriptions = await db
      .select()
      .from(pushSubscriptionTable)
      .where(eq(pushSubscriptionTable.userId, userId));

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/CareerForge_ai_final.png",
      url: payload.url || "/dashboard",
    });

    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          pushPayload
        )
      )
    );
  }

  /**
   * Send an email notification. Silently skips if SMTP is not configured.
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      // SMTP not configured — skip silently
      return;
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"CareerForge AI" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
  }

  /**
   * Create an in-app notification record in the database
   */
  async createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    metadata?: any
  ): Promise<void> {
    await db.insert(notificationTable).values({
      userId,
      type,
      title,
      body,
      metadata: metadata || null,
      read: false,
      channel: "in_app",
    });
  }

  /**
   * Unified notify: checks user preferences and dispatches to appropriate channels.
   * Always creates an in-app notification regardless of other channels.
   */
  async notify(userId: string, event: NotificationEvent): Promise<void> {
    // Always create in-app notification
    await this.createNotification(userId, event.type, event.title, event.body, event.metadata);

    // Fetch user preferences (or use defaults)
    const [prefs] = await db
      .select()
      .from(notificationPreferenceTable)
      .where(eq(notificationPreferenceTable.userId, userId))
      .limit(1);

    const pushEnabled = prefs?.pushEnabled ?? true;
    const emailEnabled = prefs?.emailEnabled ?? true;

    // Check type-specific alert preferences
    const typeAlertMap: Record<string, boolean | undefined> = {
      collaboration_comment: prefs?.collaborationAlerts ?? undefined,
      interview_score: prefs?.interviewAlerts ?? undefined,
      insight_generated: prefs?.insightAlerts ?? undefined,
      job_match: prefs?.jobMatchAlerts ?? undefined,
    };
    const typeAlertEnabled = typeAlertMap[event.type] ?? true;

    if (!typeAlertEnabled) return;

    // Build URL from metadata
    const url = this.buildUrl(event);

    // Push notification
    if (pushEnabled) {
      await this.sendPush(userId, {
        title: event.title,
        body: event.body,
        url,
      }).catch((err) => {
        console.error("[NotificationService] Push failed:", err.message);
      });
    }

    // Email notification
    if (emailEnabled && event.email) {
      await this.sendEmail(
        event.email,
        event.title,
        `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#4F46E5;">${event.title}</h2>
          <p>${event.body}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://careerforge.ai"}${url}"
             style="display:inline-block;padding:10px 20px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;margin-top:12px;">
            View in CareerForge AI
          </a>
        </div>`
      ).catch((err) => {
        console.error("[NotificationService] Email failed:", err.message);
      });
    }
  }

  /**
   * Build a navigation URL from the notification event metadata
   */
  private buildUrl(event: NotificationEvent): string {
    switch (event.type) {
      case "collaboration_comment":
        return event.metadata?.documentId
          ? `/dashboard/document/${event.metadata.documentId}/edit`
          : "/dashboard";
      case "interview_score":
        return "/dashboard/interview";
      case "insight_generated":
        return "/dashboard/automation";
      case "job_match":
        return "/dashboard/applications";
      default:
        return "/dashboard";
    }
  }
}

// Singleton instance for convenience
export const notificationService = new NotificationService();
