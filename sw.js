/**
 * GHOST-LOCKER SERVICE WORKER v2.6 [MASTER INTEGRATION]
 * Assets caching + Active API Interception Layer
 */

const CACHE_NAME = 'ghost-locker-cache-v2.6';
const assets = [
    '/',
    '/index.html',
    '/LockerSecurityAudit.js'
];

// 1. INSTALACE - Uložení souborů pro 100% offline přístup
self.addEventListener('install', e => {
    self.skipWaiting(); // Okamžité nasazení nové verze
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Archiving system assets...');
            return cache.addAll(assets);
        })
    );
});

// 2. AKTIVACE - Převzetí kontroly nad všemi klienty (taby)
self.addEventListener('activate', e => {
    e.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(keys => {
                return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
            })
        ])
    );
});

// 3. FETCH & INTERCEPT - Jádro simulace GhostStore
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // Detekce API požadavků na stav objednávky/platby
    if (url.pathname.includes('/api/v2/order') || url.pathname.includes('/status') || url.pathname.includes('/payment')) {
        
        e.respondWith(
            fetch(e.request).then(response => {
                console.log('[SW] INTERCEPTED LIVE API:', url.pathname);
                return response;
            }).catch(() => {
                // FALLBACK: Pokud server neodpovídá (offline simulace), 
                // podvrhneme natvrdo status "PAID" pro simulaci bypassu.
                console.warn('[SW] SERVER OFFLINE - FORCING PAID STATUS RESPONSE');
                
                const ghostResponse = {
                    status: "success",
                    order_id: "GHOST-777",
                    payment_status: "PAID",
                    unlock_code: "0000",
                    authorized: true
                };

                return new Response(JSON.stringify(ghostResponse), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
    } else {
        // Standardní obsluha statických souborů
        e.respondWith(
            caches.match(e.request).then(res => res || fetch(e.request))
        );
    }
});

// 4. MESSAGE HANDLING - Příjem instrukcí z UI
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'TRIGGER_BYPASS') {
        console.log('[SW] !!! GHOST-STORE BYPASS PROTOCOL ACTIVATED !!!');
        // Zde by šlo implementovat globální flag pro vynucení offline odpovědi i při online stavu
    }
});
