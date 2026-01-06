// Service Worker to make the App work offline
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('kasumalgarh-store').then((cache) => cache.addAll([
      './',
      './index.html',
      './mainstyle.css',
      './script.js',
      './family-data.js'
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});