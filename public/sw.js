const CACHE_NAME = '11-star-club-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/icon.png',
  '/apple-touch-icon.png',
  '/logo_maa_aschen.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Stale-While-Revalidate Strategy with SPA Navigation Fallback
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });

        return cachedResponse || fetchPromise.then((res) => {
          if (!res && event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return res;
        }).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      });
    })
  );
});

// Background Push Notification handler for when app/website is closed or in background
self.addEventListener('push', (event) => {
  let data = { title: '11 স্টার ক্লাব', body: 'নতুন প্রার্থনা ও বিজ্ঞপ্তি প্রকাশিত হয়েছে।' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message || '11 স্টার ক্লাব থেকে নতুন বার্তা এসেছে।',
    icon: '/icon.png',
    badge: '/pwa-192x192.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: data.tag || `11star-alert-${Date.now()}`,
    renotify: true,
    requireInteraction: true, // Keeps notification visible on lock screen until user interacts
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: '📱 ওপেন করুন' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '11 স্টার ক্লাব', options)
  );
});

// Periodic Background Sync for checking prayer times or updates when app is closed
self.addEventListener('periodicsync', (event) => {
  if (event.tag === '11star-prayer-sync') {
    event.waitUntil(
      self.registration.showNotification('🕊️ 11 স্টার ক্লাব প্রার্থনা আপডেট', {
        body: 'আজ রবিবারের সান্ধ্য প্রার্থনা ও সঙ্গীত সভার সময়সূচী পরীক্ষা করা হয়েছে।',
        icon: '/icon.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        tag: '11star-periodic-reminder',
        requireInteraction: false,
        data: { url: '/sunday-prayer' }
      })
    );
  }
});

// Client message listener to dispatch lockscreen native notifications through Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_LOCKSCREEN_NOTIFICATION') {
    const { title, options } = event.data;
    const finalOptions = {
      body: options?.body || '',
      icon: options?.icon || '/icon.png',
      badge: options?.badge || '/pwa-192x192.png',
      vibrate: options?.vibrate || [300, 100, 300, 100, 300],
      tag: options?.tag || `11star-notif-${Date.now()}`,
      renotify: true,
      requireInteraction: true, // Ensures lock screen visibility
      silent: options?.silent ?? false,
      data: options?.data || { url: '/' },
      actions: [
        { action: 'open', title: '📱 ওপেন করুন' }
      ]
    };
    event.waitUntil(
      self.registration.showNotification(title || '11 স্টার ক্লাব', finalOptions)
    );
  }
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
