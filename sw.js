const CACHE_NAME = 'sudoku-pwa-v12';
const ASSETS = [
    './',
    './index.html',
    './sudoku.html',
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

// Network-first strategy: always fetch fresh copy from server when online
self.addEventListener('fetch', e => {
    // If navigation (loading HTML page), always fetch network-first bypassing HTTP cache
    if (e.request.mode === 'navigate' || e.request.destination === 'document') {
        e.respondWith(
            fetch(e.request, { cache: 'no-cache' })
                .then(networkRes => {
                    if (networkRes && networkRes.status === 200) {
                        const clone = networkRes.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                    }
                    return networkRes;
                })
                .catch(() => caches.match(e.request).then(res => res || caches.match('./index.html')))
        );
        return;
    }

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
