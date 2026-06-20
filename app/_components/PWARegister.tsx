"use client";

import { useEffect } from "react";

// Registers the service worker and flushes any queued offline edits whenever
// the browser comes back online.
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
        // swallow — PWA is progressive enhancement
      }
    };
    register();

    const onOnline = () => {
      navigator.serviceWorker.controller?.postMessage({ type: "flush-edits" });
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  return null;
};

export default PWARegister;
