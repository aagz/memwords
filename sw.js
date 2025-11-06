const CACHE_NAME = 'memwords-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/words.json',
  '/manifest.json',
  '/assets.json'
  // Add audio files if needed, but they are many
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => fetch('/assets.json'))
      .then(response => response.json())
      .then(data => {
        const audioFiles = data.audioFiles || [];
        return caches.open(CACHE_NAME).then(cache => cache.addAll(audioFiles));
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(fetchResponse => {
          // Cache images and word files dynamically if not already cached
          if (event.request.url.includes('/img/') ||
              event.request.url.includes('/words/')) {
            const cache = caches.open(CACHE_NAME);
            cache.then(cache => cache.put(event.request, fetchResponse.clone()));
          }
          return fetchResponse;
        });
      })
  );
});