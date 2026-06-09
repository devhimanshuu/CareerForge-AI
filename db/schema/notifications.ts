import { pgTable, serial, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const notificationTable = pgTable("notification", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'collaboration_comment', 'interview_score', 'insight_generated', 'job_match'
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  metadata: jsonb("metadata"), // flexible: { documentId?, threadId?, sessionId?, packageId? }
  read: boolean("read").default(false),
  channel: varchar("channel", { length: 20 }).default("in_app"), // 'in_app', 'push', 'email'
  createdAt: timestamp("created_at").defaultNow(),
});

export const pushSubscriptionTable = pgTable("push_subscription", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationPreferenceTable = pgTable("notification_preference", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  pushEnabled: boolean("push_enabled").default(true),
  emailEnabled: boolean("email_enabled").default(true),
  collaborationAlerts: boolean("collaboration_alerts").default(true),
  interviewAlerts: boolean("interview_alerts").default(true),
  insightAlerts: boolean("insight_alerts").default(true),
  jobMatchAlerts: boolean("job_match_alerts").default(true),
});
