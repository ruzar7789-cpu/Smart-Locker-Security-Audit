const CACHE_NAME = 'ghost-locker-cache-v1';
const assets = ['/', '/index.html', '/LockerSecurityAudit.js'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
