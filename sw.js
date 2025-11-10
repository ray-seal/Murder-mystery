// Simple service worker: cache app shell for offline + network-first for images
const CACHE_NAME = 'case-files-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest',
  '/icon.svg'
];

// On install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// On activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : Promise.resolve())
    ))
  );
  self.clients.claim();
});

// Fetch: respond from cache first for app shell, network-first for images
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // For images (Unsplash), try network first then cache fallback
  if (req.destination === 'image' || url.hostname.includes('images.unsplash.com')) {
    event.respondWith(
      fetch(req).then(res => {
        // optionally cache images
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // For other requests, try cache first
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).catch(() => caches.match('/')))
  );
});
