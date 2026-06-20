CREATE TABLE IF NOT EXISTS "usage_event" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar(255) NOT NULL,
  "feature_id" varchar(100) NOT NULL,
  "action" varchar(50) NOT NULL,
  "variant" varchar(50),
  "funnel" varchar(50),
  "metadata" jsonb,
  "duration_ms" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "usage_event_user_idx" ON "usage_event" ("user_id");
CREATE INDEX IF NOT EXISTS "usage_event_feature_idx" ON "usage_event" ("feature_id");
CREATE INDEX IF NOT EXISTS "usage_event_funnel_idx" ON "usage_event" ("funnel");
CREATE INDEX IF NOT EXISTS "usage_event_created_idx" ON "usage_event" ("created_at");
