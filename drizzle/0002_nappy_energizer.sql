ALTER TABLE "document" ADD COLUMN "slug" varchar(255);--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "template" "template" DEFAULT 'modern' NOT NULL;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "unique_visitors" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "click_throughs" integer DEFAULT 0 NOT NULL;