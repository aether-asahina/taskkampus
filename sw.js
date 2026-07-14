// Service Worker untuk Push Notification
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'TaskKampus';
  const options = {
    body: data.body || 'Ada tugas yang deadline-nya mendekat!',
    icon: data.icon || '/icon.png',
    badge: '/icon.png',
    data: { url: data.url || '/dashboard.html' },
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/dashboard.html')
  );
});
