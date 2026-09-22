// Firebase Cloud Messaging Service Worker for background push notifications
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Push event listener for when app/PWA is closed
self.addEventListener('push', (event) => {
  let data = { title: '11 স্টার ক্লাব', body: 'নতুন প্রার্থনা ও বিজ্ঞপ্তি প্রকাশিত হয়েছে।' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const notificationTitle = data.title || data.notification?.title || '11 স্টার ক্লাব';
  const notificationOptions = {
    body: data.body || data.message || data.notification?.body || '11 স্টার ক্লাব থেকে নতুন বার্তা এসেছে।',
    icon: '/icon.png',
    badge: '/pwa-192x192.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: data.tag || `11star-alert-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || data.data?.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: '📱 ওপেন করুন' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl) || targetUrl === '/') {
            return client.focus();
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
