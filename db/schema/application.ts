import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { documentTable } from "./document";

export const applicationStatusEnum = pgEnum("application_status", [
  "wishlist",
  "applied",
  "interviewing",
  "offer",
  "rejected",
]);

export const applicationTable = pgTable("application", {
  id: serial("id").notNull().primaryKey(),
  userId: varchar("user_id").notNull(),
  documentId: varchar("document_id").notNull(), // Specific resume version linked
  jobTitle: varchar("job_title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  status: applicationStatusEnum("status").notNull().default("wishlist"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const coverLetterTable = pgTable("cover_letter", {
  id: serial("id").notNull().primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applicationTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  tone: varchar("tone", { length: 50 }).notNull(), // Confident, Enthusiastic, Formal, Direct
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const applicationRelations = relations(applicationTable, ({ one }) => ({
  document: one(documentTable, {
    fields: [applicationTable.documentId],
    references: [documentTable.documentId],
  }),
  coverLetter: one(coverLetterTable, {
    fields: [applicationTable.id],
    references: [coverLetterTable.applicationId],
  }),
}));
