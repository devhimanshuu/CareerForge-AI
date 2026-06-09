import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { documentTable } from "./document";

export const analyticsEventTable = pgTable("analytics_event", {
  id: serial("id").notNull().primaryKey(),
  documentId: varchar("document_id", { length: 255 })
    .notNull()
    .references(() => documentTable.documentId, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  visitorHash: varchar("visitor_hash", { length: 128 }).notNull(),
  source: varchar("source", { length: 255 }),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  device: varchar("device", { length: 50 }),
  country: varchar("country", { length: 100 }),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const portfolioLeadTable = pgTable("portfolio_lead", {
  id: serial("id").notNull().primaryKey(),
  documentId: varchar("document_id", { length: 255 })
    .notNull()
    .references(() => documentTable.documentId, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  linkedin: varchar("linkedin", { length: 500 }),
  message: text("message"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});
