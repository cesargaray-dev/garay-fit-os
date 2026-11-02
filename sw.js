// Service Worker for GARAY FIT OS // Marcy Pro & Circadian Edition
const CACHE_NAME = 'garay-fit-os-v2.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/data.js',
  './js/audio.js',
  './js/storage.js',
  './js/wakelock.js',
  './js/notifications.js',
  './js/marcy-svg.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg',
  './icons/apple-touch-icon.png',
  './icons/qr-install.png',
  './assets/chest_press.jpg',
  './assets/pec_deck.jpg',
  './assets/lat_pulldown.jpg',
  './assets/seated_row.jpg',
  './assets/tricep_pushdown.jpg',
  './assets/bicep_curl.jpg',
  './assets/leg_extension.jpg',
  './assets/hamstring_curl.jpg',
  './assets/bulgarian_squat.jpg',
  './assets/cable_crunch.jpg',
  './assets/lateral_raise.jpg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First for HTML and JS, Cache First for media assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isScriptOrDoc = event.request.destination === 'document' || 
                        event.request.destination === 'script' || 
                        url.pathname.endsWith('.js') || 
                        url.pathname.endsWith('.html');

  if (isScriptOrDoc) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request).then(cached => cached || caches.match('./index.html'));
      })
    );
    return;
  }

  // Cache first with network fallback for images and static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const resClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return networkResponse;
      }).catch(() => {
        // Fallback for missing offline assets
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});

// Push and Notification Click Events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || './index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
