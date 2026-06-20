"use client";

import { useCallback } from "react";

type TrackPayload = {
  featureId: string;
  action: string;
  variant?: string;
  funnel?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
};

// Fire-and-forget product analytics tracking. Uses sendBeacon when available so
// events still flush on navigation. Safe to call from any client component.
export function useTrackUsage() {
  const track = useCallback((payload: TrackPayload) => {
    if (typeof window === "undefined") return;
    try {
      const body = JSON.stringify(payload);
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
    } catch {
      // analytics must never break the app
    }
  }, []);

  return { track };
}
