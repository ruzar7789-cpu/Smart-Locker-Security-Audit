/**
 * GHOST-LOCKER SERVICE WORKER v2.5
 * Assets caching + API Interception Layer
 */

const CACHE_NAME = 'ghost-locker-cache-v2';
const assets = [
    '/',
    '/index.html',
    '/LockerSecurityAudit.js'
];

// 1. INSTALACE - Uložení souborů pro offline režim
self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Archiving assets for offline audit...');
            return cache.addAll(assets);
        })
    );
});

// 2. AKTIVACE - Vyčištění staré cache
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
        })
    );
});

// 3. FETCH - Tady probíhá odposlech (The Core of GhostStore Bypass)
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // SPECIÁLNÍ LOGIKA: Pokud narazíme na požadavek o stavu zásilky/platby
    if (url.pathname.includes('/api/v2/order') || url.pathname.includes('/status')) {
        e.respondWith(
            fetch(e.request).then(response => {
                // Tady v budoucnu můžeme modifikovat JSON odpověď ze serveru
                console.log('[SW] INTERCEPTED API CALL:', url.pathname);
                return response;
            }).catch(() => {
                // Pokud jsme offline, podstrčíme "PAID" status z cache (pokud ho tam máme)
                return caches.match(e.request);
            })
        );
    } else {
        // Standardní chování pro zbytek aplikace
        e.respondWith(
            caches.match(e.request).then(res => res || fetch(e.request))
        );
    }
});

// 4. MESSAGE HANDLING - Komunikace s hlavním UI (LockerSecurityAudit.js)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'TRIGGER_BYPASS') {
        console.log('[SW] GhostStore Bypass Signal Received!');
        // Zde se aktivuje vynucená manipulace s daty
    }
});
