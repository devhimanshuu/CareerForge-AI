CREATE TABLE IF NOT EXISTS "review_comment" (
  "id" serial PRIMARY KEY NOT NULL,
  "document_id" varchar(255) NOT NULL,
  "section_id" varchar(100) NOT NULL,
  "selected_text" text,
  "reviewer_name" varchar(120) NOT NULL,
  "reviewer_email" varchar(255),
  "content" text NOT NULL,
  "status" varchar(30) DEFAULT 'open' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_insight" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar(255) NOT NULL,
  "document_id" varchar(255),
  "type" varchar(60) NOT NULL,
  "title" varchar(255) NOT NULL,
  "summary" text NOT NULL,
  "payload" text,
  "status" varchar(30) DEFAULT 'new' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration_snapshot" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar(255) NOT NULL,
  "document_id" varchar(255),
  "provider" varchar(50) NOT NULL,
  "username" varchar(255) NOT NULL,
  "data" text NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automation_config" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar(255) NOT NULL,
  "document_id" varchar(255) NOT NULL,
  "type" varchar(60) NOT NULL,
  "config" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "last_run_at" timestamp,
  "next_run_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_comment" ADD CONSTRAINT "review_comment_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_insight" ADD CONSTRAINT "agent_insight_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_config" ADD CONSTRAINT "automation_config_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration_snapshot" ADD CONSTRAINT "integration_snapshot_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_comment_document_id_idx" ON "review_comment" ("document_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_comment_status_idx" ON "review_comment" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_insight_user_id_idx" ON "agent_insight" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_insight_document_id_idx" ON "agent_insight" ("document_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "integration_snapshot_provider_user_unique" ON "integration_snapshot" ("user_id","provider","username");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_snapshot_document_id_idx" ON "integration_snapshot" ("document_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "automation_config_user_document_type_unique" ON "automation_config" ("user_id","document_id","type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "automation_config_next_run_at_idx" ON "automation_config" ("next_run_at");
