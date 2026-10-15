self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      let target = new URL("/?view=calendar", self.location.origin);
      try {
        const requested = new URL(
          event.notification.data?.url || "/?view=calendar",
          self.location.origin,
        );
        if (requested.origin === self.location.origin) target = requested;
      } catch {
        /* Keep the safe app URL. */
      }
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const existing = windows.find(
        (client) => new URL(client.url).origin === self.location.origin,
      );
      if (existing) {
        existing.postMessage({
          type: "assistant-open-view",
          view: target.searchParams.get("view") || "today",
        });
        return existing.focus();
      }
      return self.clients.openWindow(target.href);
    })(),
  );
});
