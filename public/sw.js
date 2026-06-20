// CareerForge AI — Service Worker (Push + Offline Editor Cache)
/* eslint-disable no-restricted-globals */

const CACHE_VERSION = "careerforge-v1";
const APP_SHELL = [
  "/",
  "/dashboard",
  "/CareerForge_ai_final.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigations and APIs (so the editor stays fresh),
// cache-first for static assets, and a fallback to the cached shell offline.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isStatic = /\.(?:js|css|png|jpg|jpeg|svg|ico|woff2?|ttf)$/.test(url.pathname);
  // Auth-gated dashboard / API responses must never be cached — they leak
  // user data across sessions and stay stale after logout.
  const isPrivate =
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up");

  if (isStatic) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          })
      )
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (
          !isPrivate &&
          res &&
          res.status === 200 &&
          req.headers.get("accept")?.includes("text/html")
        ) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => {
        if (isPrivate) {
          // Offline fallback for private routes: a tiny shell, not a stale page.
          return new Response(
            "<!doctype html><meta charset=utf-8><title>Offline</title><body style='font-family:system-ui;padding:2rem;text-align:center'><h1>You're offline</h1><p>Your edits are queued and will sync when you reconnect.</p></body>",
            { headers: { "Content-Type": "text/html" } }
          );
        }
        return caches.match(req).then((cached) => cached || caches.match("/"));
      })
  );
});

// Offline edit queue: client posts {url, method, body, headers} via postMessage("queue-edit").
// On reconnect, we replay them. Stored in IndexedDB-backed cache via a simple cache trick.
const EDIT_QUEUE_CACHE = "careerforge-edit-queue";

self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "queue-edit" && msg.payload) {
    event.waitUntil(
      caches.open(EDIT_QUEUE_CACHE).then((cache) => {
        const key = new Request(`/__queued/${Date.now()}-${Math.random()}`);
        const value = new Response(JSON.stringify(msg.payload), {
          headers: { "content-type": "application/json" },
        });
        return cache.put(key, value);
      })
    );
  }
  if (msg.type === "flush-edits") {
    event.waitUntil(flushQueuedEdits());
  }
  if (msg.type === "skip-waiting") self.skipWaiting();
});

async function flushQueuedEdits() {
  const cache = await caches.open(EDIT_QUEUE_CACHE);
  const keys = await cache.keys();
  // Tell the page to replay through fetch() — fetch from a page context
  // automatically attaches cookies (incl. Clerk session), which a raw SW
  // fetch does not on all browsers. The SW just curates the queue.
  const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const key of keys) {
    const res = await cache.match(key);
    if (!res) continue;
    const payload = await res.json();

    if (allClients.length > 0) {
      allClients[0].postMessage({ type: "replay-edit", payload, cacheKey: key.url });
      // The page is responsible for ack'ing via { type: "ack-edit", cacheKey }.
      continue;
    }

    // No open window — fall back to SW fetch with credentials: 'include'.
    try {
      const response = await fetch(payload.url, {
        method: payload.method || "POST",
        headers: payload.headers || { "content-type": "application/json" },
        body: payload.body ? JSON.stringify(payload.body) : undefined,
        credentials: "include",
      });
      if (response.ok) await cache.delete(key);
    } catch {
      // leave queued for the next flush
    }
  }
}

// Page acks the SW after it has successfully replayed an edit; we then drop
// the queue entry. Lets us bypass cookie issues by using the page fetcher.
self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "ack-edit" && msg.cacheKey) {
    event.waitUntil(
      caches.open(EDIT_QUEUE_CACHE).then((cache) => cache.delete(msg.cacheKey))
    );
  }
});

self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || "New notification from CareerForge AI",
    icon: "/CareerForge_ai_final.png",
    badge: "/CareerForge_ai_final.png",
    data: { url: data.url || "/dashboard" },
    actions: [
      { action: "open", title: "Open" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || "CareerForge AI", options)
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(event.notification.data.url);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});
