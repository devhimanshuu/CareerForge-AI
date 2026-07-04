DO $$ BEGIN
  CREATE TYPE "interview_status" AS ENUM ('active', 'completed', 'abandoned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "interview_type" AS ENUM ('mixed', 'behavioral', 'technical', 'case-study', 'leadership');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "interview_difficulty" AS ENUM ('adaptive', 'standard', 'challenging', 'expert');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "interview_session" (
  "id" serial PRIMARY KEY NOT NULL,
  "document_id" varchar(255),
  "user_id" varchar(255) NOT NULL,
  "target_role" varchar(255) NOT NULL,
  "job_description" text,
  "interview_type" "interview_type" NOT NULL DEFAULT 'mixed',
  "difficulty" "interview_difficulty" NOT NULL DEFAULT 'adaptive',
  "total_score" integer,
  "delivery_score" integer,
  "content_score" integer,
  "star_score" integer,
  "evaluation_data" text,
  "status" "interview_status" NOT NULL DEFAULT 'active',
  "started_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "interview_session_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "document"("document_id") ON DELETE SET null
);

CREATE INDEX IF NOT EXISTS "interview_session_user_idx" ON "interview_session" ("user_id");

CREATE TABLE IF NOT EXISTS "interview_turn" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" integer NOT NULL,
  "turn_number" integer NOT NULL,
  "question_text" text NOT NULL,
  "answer_text" text,
  "answer_audio_url" text,
  "turn_score" integer,
  "feedback" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "interview_turn_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "interview_session"("id") ON DELETE cascade
);
