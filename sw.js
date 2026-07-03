const CACHE_NAME = 'carousel-maker-v4';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './logo-192.png',
  './logo-512.png',
  './gilroy-regular.woff2',
  './gilroy-medium.woff2',
  './gilroy-bold.woff2',
  './gilroy-heavy.woff2',
  './gilroy-light.woff2'
];

// Install Service Worker dan simpan aset utama ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Strategi Stale-While-Revalidate untuk Fitur OFFLINE sepenuhnya
// Termasuk cache dinamis untuk CDN Swiper, HTML2Canvas, dan Google Fonts
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Selalu coba ambil dari jaringan terlebih dahulu untuk update
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Jangan cache jika respon gagal atau bukan dari HTTP/HTTPS
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
          return networkResponse;
        }
        
        // Simpan ke cache secara dinamis
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          if (event.request.method === 'GET') {
            cache.put(event.request, responseToCache);
          }
        });
        return networkResponse;
      }).catch(() => {
        // Jika offline dan network gagal, abaikan error (kembali ke cachedResponse)
      });

      // Kembalikan versi cache langsung agar super cepat, jika tidak ada tunggu dari jaringan
      return cachedResponse || fetchPromise;
    })
  );
});

// Bersihkan cache versi lama
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
