const CACHE_NAME = 'riowallet-v1';
const FONT_CACHE = 'riowallet-fonts-v1';

const APP_SHELL = [
  './',
  './index.html',
  './currencies.json',
  './APIrequest.js',
  './manifest.json',
  './assets/flags/ro.svg',
  './assets/flags/eu.svg',
  './assets/flags/us.svg',
  './assets/flags/jp.svg',
  './assets/flags/pl.svg',
  './assets/UI/logo2.svg',
  './assets/UI/reset.svg',
  './assets/UI/info.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== FONT_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. Bypass cache for external API calls (app logic handles offline state)
  if (url.hostname.includes('frankfurter') || url.hostname.includes('corsproxy')) {
    return;
  }

  // 2. Cache Google Fonts dynamically
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(networkResponse => {
          const responseClone = networkResponse.clone();
          caches.open(FONT_CACHE).then(cache => cache.put(event.request, responseClone));
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Cache-first strategy for App Shell
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});