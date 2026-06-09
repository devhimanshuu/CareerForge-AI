import {
  boolean,
  index,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { documentTable } from "./document";

export const reviewCommentTable = pgTable(
  "review_comment",
  {
    id: serial("id").notNull().primaryKey(),
    documentId: varchar("document_id", { length: 255 })
      .notNull()
      .references(() => documentTable.documentId, { onDelete: "cascade" }),
    sectionId: varchar("section_id", { length: 100 }).notNull(),
    selectedText: text("selected_text"),
    reviewerName: varchar("reviewer_name", { length: 120 }).notNull(),
    reviewerEmail: varchar("reviewer_email", { length: 255 }),
    content: text("content").notNull(),
    status: varchar("status", { length: 30 }).notNull().default("open"),
    ownerReply: text("owner_reply"),
    ownerRepliedAt: timestamp("owner_replied_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { mode: "string" }),
  },
  (table) => ({
    documentIdx: index("review_comment_document_id_idx").on(table.documentId),
    statusIdx: index("review_comment_status_idx").on(table.status),
  }),
);

export const agentInsightTable = pgTable(
  "agent_insight",
  {
    id: serial("id").notNull().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    documentId: varchar("document_id", { length: 255 }).references(
      () => documentTable.documentId,
      { onDelete: "cascade" },
    ),
    type: varchar("type", { length: 60 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary").notNull(),
    payload: text("payload"),
    status: varchar("status", { length: 30 }).notNull().default("new"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("agent_insight_user_id_idx").on(table.userId),
    documentIdx: index("agent_insight_document_id_idx").on(table.documentId),
  }),
);

export const integrationSnapshotTable = pgTable(
  "integration_snapshot",
  {
    id: serial("id").notNull().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    documentId: varchar("document_id", { length: 255 }).references(
      () => documentTable.documentId,
      { onDelete: "set null" },
    ),
    provider: varchar("provider", { length: 50 }).notNull(),
    username: varchar("username", { length: 255 }).notNull(),
    data: text("data").notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (table) => ({
    providerUserUnique: uniqueIndex("integration_snapshot_provider_user_unique").on(
      table.userId,
      table.provider,
      table.username,
    ),
    documentIdx: index("integration_snapshot_document_id_idx").on(table.documentId),
  }),
);

export const automationConfigTable = pgTable(
  "automation_config",
  {
    id: serial("id").notNull().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    documentId: varchar("document_id", { length: 255 })
      .notNull()
      .references(() => documentTable.documentId, { onDelete: "cascade" }),
    type: varchar("type", { length: 60 }).notNull(),
    config: text("config").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    lastRunAt: timestamp("last_run_at", { mode: "string" }),
    nextRunAt: timestamp("next_run_at", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (table) => ({
    userDocumentTypeUnique: uniqueIndex("automation_config_user_document_type_unique").on(
      table.userId,
      table.documentId,
      table.type,
    ),
    nextRunIdx: index("automation_config_next_run_at_idx").on(table.nextRunAt),
  }),
);
