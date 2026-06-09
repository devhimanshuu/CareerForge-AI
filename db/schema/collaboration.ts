import {
  boolean,
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { documentTable } from "./document";

export const collaborationThreadTable = pgTable(
  "collaboration_thread",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    documentId: varchar("document_id", { length: 255 })
      .notNull()
      .references(() => documentTable.documentId, { onDelete: "cascade" }),
    sectionId: varchar("section_id", { length: 100 }).notNull(),
    selectedText: varchar("selected_text", { length: 1000 }),
    highlightRange: jsonb("highlight_range"), // { start: number, end: number }
    authorName: varchar("author_name", { length: 255 }).notNull(),
    authorEmail: varchar("author_email", { length: 255 }),
    authorColor: varchar("author_color", { length: 7 }),
    content: varchar("content", { length: 2000 }).notNull(),
    replies: jsonb("replies").default([]), // Array of { author, content, createdAt }
    resolved: boolean("resolved").default(false),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    resolvedAt: timestamp("resolved_at", { mode: "string" }),
  },
  (table) => ({
    documentIdx: index("collaboration_thread_document_id_idx").on(
      table.documentId,
    ),
    sectionIdx: index("collaboration_thread_section_id_idx").on(
      table.sectionId,
    ),
    resolvedIdx: index("collaboration_thread_resolved_idx").on(
      table.resolved,
    ),
  }),
);