const CACHE_NAME = 'ghost-cache-v2.9';
let bypassActive = false;

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('message', event => {
    if (event.data.type === 'TRIGGER_BYPASS') {
        bypassActive = true;
        console.log('[SW] GHOST-STORE BYPASS AKTIVNÍ');
    }
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    if (bypassActive && (url.pathname.includes('order') || url.pathname.includes('status'))) {
        e.respondWith(
            new Response(JSON.stringify({
                status: "success",
                payment_status: "PAID",
                authorized: true,
                can_open: true
            }), { headers: { 'Content-Type': 'application/json' } })
        );
    } else {
        e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    }
});
