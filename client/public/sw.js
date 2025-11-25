// 서비스 워커 - 푸시 알림 처리

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || "BILIDA";
  const options = {
    body: data.message || data.body || "",
    icon: data.icon || "/vite.svg",
    badge: "/vite.svg",
    data: data.data || {},
    tag: data.tag || "default",
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/notifications";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열린 창이 있으면 포커스
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener("install", (event) => {
  console.log("서비스 워커 설치됨");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("서비스 워커 활성화됨");
  event.waitUntil(clients.claim());
});
