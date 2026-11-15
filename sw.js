const CACHE_NAME = 'sudoku-pwa-v11';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
        )).then(() => self.clients.claim())
    );
});

// Network-first strategy: always fetch fresh copy when online, fallback to cache when offline
self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request)
            .then(networkRes => {
                if (networkRes && networkRes.status === 200 && e.request.method === 'GET') {
                    const clone = networkRes.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return networkRes;
            })
            .catch(() => caches.match(e.request))
    );
});
