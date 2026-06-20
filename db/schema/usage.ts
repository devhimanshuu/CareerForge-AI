import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// User-scoped product analytics: tracks which features users engage with,
// A/B test exposures and conversions, and pricing/upgrade funnel events.
// Distinct from analytics_event (which tracks public portfolio visitor traffic).
export const usageEventTable = pgTable(
  "usage_event",
  {
    id: serial("id").notNull().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    featureId: varchar("feature_id", { length: 100 }).notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    variant: varchar("variant", { length: 50 }),
    funnel: varchar("funnel", { length: 50 }),
    metadata: jsonb("metadata"),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("usage_event_user_idx").on(t.userId),
    featureIdx: index("usage_event_feature_idx").on(t.featureId),
    funnelIdx: index("usage_event_funnel_idx").on(t.funnel),
    createdIdx: index("usage_event_created_idx").on(t.createdAt),
  })
);
