// Increment this to bust old caches when deploying
const CACHE_VERSION = 3;
const CACHE_NAME = `noor-alhuda-v${CACHE_VERSION}`;

// App shell assets to precache
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Helper: cache static assets (stale-while-revalidate)
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    // Update in background
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
    }).catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (response && response.status === 200) {
    cache.put(request, response.clone());
  }
  return response;
}

// Helper: network-first for HTML navigations
async function networkFirstNavigation(event) {
  try {
    const response = await fetch(event.request);
    const cache = await caches.open(CACHE_NAME);
    if (response && response.status === 200) {
      cache.put(event.request, response.clone());
    }
    return response;
  } catch (err) {
    // Fallback to cached index if offline
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match('/index.html');
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => {
      if (key !== CACHE_NAME) {
        return caches.delete(key);
      }
    }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never cache non-GET requests
  if (request.method !== 'GET') {
    return event.respondWith(fetch(request));
  }

  const url = new URL(request.url);

  // Bypass cache entirely for API calls to always get fresh data
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(fetch(request));
  }

  // For navigations (SPA routes), use network-first
  if (request.mode === 'navigate') {
    return event.respondWith(networkFirstNavigation(event));
  }

  // For static assets (scripts, styles, images, fonts), use cache-first
  const destination = request.destination;
  const staticDestinations = ['script', 'style', 'image', 'font', 'manifest'];
  if (staticDestinations.includes(destination)) {
    return event.respondWith(cacheFirst(request));
  }

  // Default: try cache first, fall back to network
  return event.respondWith(cacheFirst(request));
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من نور الهدى',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    dir: 'rtl',
    lang: 'ar'
  };

  event.waitUntil(
    self.registration.showNotification('نور الهدى', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

