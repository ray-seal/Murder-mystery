// Service worker: use navigation/network-first strategy and bump cache name so installed PWAs update
const CACHE_NAME = 'case-files-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : Promise.resolve())
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Navigation requests: network-first (so installed PWA gets updated HTML)
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Images: network-first with cache fallback
  if (req.destination === 'image' || url.hostname.includes('images.unsplash.com')) {
    event.respondWith(
      fetch(req).then(res => res).catch(() => caches.match(req))
    );
    return;
  }

  // Other requests: cache-first
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).catch(() => caches.match('/')))
  );
});
