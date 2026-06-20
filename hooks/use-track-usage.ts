"use client";

import { useCallback, useEffect, useRef } from "react";

type TrackPayload = {
  featureId: string;
  action: string;
  variant?: string;
  funnel?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
};

// Module-level queue so dedupe + batching survive across hook instances
// (e.g. every NavItem mounts its own copy of the hook).
const queue: TrackPayload[] = [];
const recentKeys = new Map<string, number>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

// Drop duplicate events from the same caller fired within DEDUPE_MS of each other
// — e.g. a user double-clicking a nav link shouldn't send two `navigate` events.
const DEDUPE_MS = 800;
const BATCH_MS = 500;

const keyOf = (p: TrackPayload) =>
  `${p.featureId}::${p.action}::${p.variant || ""}::${p.funnel || ""}`;

const flush = () => {
  flushTimer = null;
  if (queue.length === 0) return;
  const batch = queue.splice(0, queue.length);

  // Single event => keep using sendBeacon for navigation-safe delivery.
  // Multiple events => fire one POST per event but in parallel.
  if (batch.length === 1) {
    const body = JSON.stringify(batch[0]);
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/usage/track", blob);
      if (ok) return;
    }
    fetch("/api/usage/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
    return;
  }

  batch.forEach((p) => {
    fetch("/api/usage/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
      keepalive: true,
    }).catch(() => {});
  });
};

// Fire-and-forget product analytics tracking with:
//  • module-level dedupe (800ms) — prevents accidental duplicates
//  • 500ms batching — coalesces bursts (e.g. multiple feature usages in a row)
//  • sendBeacon when only one event is pending, so it survives navigation
export function useTrackUsage() {
  const mounted = useRef(true);
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const track = useCallback((payload: TrackPayload) => {
    if (typeof window === "undefined") return;

    const key = keyOf(payload);
    const now = Date.now();
    const last = recentKeys.get(key);
    if (last !== undefined && now - last < DEDUPE_MS) return;
    recentKeys.set(key, now);
    // Garbage-collect old dedupe keys so the map doesn't grow forever.
    if (recentKeys.size > 200) {
      const cutoff = now - DEDUPE_MS * 5;
      Array.from(recentKeys.entries()).forEach(([k, ts]) => {
        if (ts < cutoff) recentKeys.delete(k);
      });
    }

    queue.push(payload);
    if (!flushTimer) flushTimer = setTimeout(flush, BATCH_MS);
  }, []);

  return { track };
}
