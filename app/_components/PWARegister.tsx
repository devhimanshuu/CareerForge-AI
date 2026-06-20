"use client";

import { useEffect } from "react";

// Registers the service worker, flushes any queued offline edits whenever
// the browser comes back online, and replays edits through the page's fetch
// so cookies (Clerk session) are attached correctly.
const PWARegister = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        if (navigator.onLine && reg.active) {
          reg.active.postMessage({ type: "flush-edits" });
        }
      } catch {
        // PWA is progressive enhancement; never block the app.
      }
    };
    register();

    const onOnline = () => {
      navigator.serviceWorker.controller?.postMessage({ type: "flush-edits" });
    };
    window.addEventListener("online", onOnline);

    // SW asks the page to replay an edit (so cookies travel with the request).
    const onMessage = async (event: MessageEvent) => {
      const msg = event.data || {};
      if (msg.type !== "replay-edit" || !msg.payload) return;
      try {
        const res = await fetch(msg.payload.url, {
          method: msg.payload.method || "POST",
          headers: msg.payload.headers || { "Content-Type": "application/json" },
          body: msg.payload.body ? JSON.stringify(msg.payload.body) : undefined,
          credentials: "same-origin",
        });
        if (res.ok) {
          navigator.serviceWorker.controller?.postMessage({
            type: "ack-edit",
            cacheKey: msg.cacheKey,
          });
        }
      } catch {
        // SW will retry on the next online tick.
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("online", onOnline);
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  return null;
};

export default PWARegister;
