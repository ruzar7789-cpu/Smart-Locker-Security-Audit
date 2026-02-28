/**
 * GHOST-LOCKER SERVICE WORKER v2.7 [MASTER INTEGRATION]
 * Modifikace: Aktivní Intercept Layer (Real-time Injector)
 */

const CACHE_NAME = 'ghost-locker-cache-v2.7';
let bypassActive = false; // Globální stav pro vynucení bypassu

const assets = [
    '/',
    '/index.html',
    '/LockerSecurityAudit.js'
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim());
});

// 3. FETCH & INTERCEPT - Jádro simulace GhostStore
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // Detekce API požadavků (rozšířeno o časté endpointy boxů)
    const isOrderAPI = url.pathname.includes('/api/v') && 
                       (url.pathname.includes('order') || 
                        url.pathname.includes('status') || 
                        url.pathname.includes('payment') ||
                        url.pathname.includes('lock'));

    if (isOrderAPI) {
        e.respondWith(
            (async () => {
                try {
                    // Pokud je bypass vypnutý, zkusíme reálnou síť
                    if (!bypassActive) {
                        const response = await fetch(e.request);
                        return response;
                    }

                    // Pokud je bypass AKTIVNÍ, generujeme falešnou pozitivní odpověď okamžitě
                    console.log(`[SW] INJECTING GHOST-DATA TO: ${url.pathname}`);
                    
                    const ghostResponse = {
                        status: "success",
                        order_id: "GHOST-" + Math.floor(Math.random() * 999),
                        payment_status: "PAID",
                        payment_state: "paid", // Některá API používají malá písmena
                        authorized: true,
                        unlock_code: "1234",
                        can_open: true,
                        error: null
                    };

                    return new Response(JSON.stringify(ghostResponse), {
                        status: 200,
                        statusText: 'OK',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*' 
                        }
                    });

                } catch (err) {
                    // Fallback při totálním výpadku
                    return new Response(JSON.stringify({ status: "offline_bypass", payment_status: "PAID" }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            })()
        );
    } else {
        // Standardní cache pro zbytek
        e.respondWith(
            caches.match(e.request).then(res => res || fetch(e.request))
        );
    }
});

// 4. MESSAGE HANDLING - Zapnutí/Vypnutí bypassu z UI
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'TRIGGER_BYPASS') {
        bypassActive = true;
        console.log('[SW] !!! GHOST-STORE BYPASS PROTOCOL ENGAGED !!!');
    }
    if (event.data && event.data.type === 'STOP_BYPASS') {
        bypassActive = false;
        console.log('[SW] BYPASS DISENGAGED');
    }
});
