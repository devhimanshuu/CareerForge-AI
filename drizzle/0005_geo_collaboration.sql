ALTER TABLE "analytics_event" ADD COLUMN IF NOT EXISTS "country" varchar(100);
ALTER TABLE "review_comment" ADD COLUMN IF NOT EXISTS "owner_reply" text;
ALTER TABLE "review_comment" ADD COLUMN IF NOT EXISTS "owner_replied_at" timestamp;
