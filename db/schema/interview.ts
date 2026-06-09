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

export const interviewStatusEnum = pgEnum("interview_status", [
  "active",
  "completed",
  "abandoned",
]);

export const interviewTypeEnum = pgEnum("interview_type", [
  "mixed",
  "behavioral",
  "technical",
  "case-study",
  "leadership",
]);

export const interviewDifficultyEnum = pgEnum("interview_difficulty", [
  "adaptive",
  "standard",
  "challenging",
  "expert",
]);

export const interviewSessionTable = pgTable("interview_session", {
  id: serial("id").notNull().primaryKey(),
  documentId: varchar("document_id", { length: 255 }).references(
    () => documentTable.documentId,
    { onDelete: "set null" },
  ),
  userId: varchar("user_id", { length: 255 }).notNull(),
  targetRole: varchar("target_role", { length: 255 }).notNull(),
  jobDescription: text("job_description"),
  interviewType: interviewTypeEnum("interview_type").notNull().default("mixed"),
  difficulty: interviewDifficultyEnum("difficulty").notNull().default("adaptive"),
  totalScore: integer("total_score"),
  deliveryScore: integer("delivery_score"),
  contentScore: integer("content_score"),
  starScore: integer("star_score"),
  status: interviewStatusEnum("status").notNull().default("active"),
  startedAt: timestamp("started_at", { mode: "string" }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const interviewTurnTable = pgTable("interview_turn", {
  id: serial("id").notNull().primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => interviewSessionTable.id, { onDelete: "cascade" }),
  turnNumber: integer("turn_number").notNull(),
  questionText: text("question_text").notNull(),
  answerText: text("answer_text"),
  answerAudioUrl: text("answer_audio_url"),
  turnScore: integer("turn_score"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const interviewSessionRelations = relations(interviewSessionTable, ({ one, many }) => ({
  document: one(documentTable, {
    fields: [interviewSessionTable.documentId],
    references: [documentTable.documentId],
  }),
  turns: many(interviewTurnTable),
}));

export const interviewTurnRelations = relations(interviewTurnTable, ({ one }) => ({
  session: one(interviewSessionTable, {
    fields: [interviewTurnTable.sessionId],
    references: [interviewSessionTable.id],
  }),
}));
