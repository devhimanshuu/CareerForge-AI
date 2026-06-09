// CareerForge AI — Service Worker for Push Notifications
/* eslint-disable no-restricted-globals */

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
        // Focus existing window if available
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(event.notification.data.url);
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});
