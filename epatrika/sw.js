const CACHE_NAME = 'shaadi-card-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/card.html',
  '/manifest.json',
  '/icon.svg',
  '/styles/creator.css',
  '/styles/card.css',
  '/styles/themes/ivory.css',
  '/styles/themes/midnight.css',
  '/styles/themes/blush.css',
  '/js/creator.js',
  '/js/card.js',
  '/js/gestures.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Cache skipped some missing assets:', err);
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || e.request.url.includes('/api/')) return;
  
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});
