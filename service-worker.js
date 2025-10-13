// Service Worker for Blocksense Network Monitor
const CACHE_NAME = 'blocksense-monitor-v1.4.2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/community-calls.html',
    '/info-howto.html',
    '/light.css',
    '/script.js',
    '/data.js',
    '/config.js',
    '/notifications.js',
    '/analytics.js',
    '/pirate.png',
    '/x.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker installed');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Eski cache'leri temizle - mevcut cache adından farklı olanları sil
                        if (cacheName !== CACHE_NAME && cacheName.startsWith('blocksense-monitor-')) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated - old caches cleaned');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    const url = new URL(event.request.url);
    const isHtml = event.request.mode === 'navigate' || url.pathname.endsWith('.html');
    const isJs = url.pathname.endsWith('.js');
    const isCss = url.pathname.endsWith('.css');

    // Network-first for HTML/JS/CSS to always show the latest
    if (isHtml || isJs || isCss) {
        event.respondWith(
            fetch(new Request(event.request, { cache: 'no-store' }))
                .then((networkResponse) => {
                    // Cache successful responses for offline fallback
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Fallback to cache when offline
                    return caches.match(event.request).then((cached) => {
                        if (cached) return cached;
                        if (isHtml) return caches.match('/index.html');
                        return new Response('', { status: 503, statusText: 'Service Unavailable' });
                    });
                })
        );
        return;
    }

    // Default: cache-first with network fallback for other assets
    event.respondWith(
        caches.match(event.request)
            .then((cached) => cached || fetch(event.request))
            .then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => new Response('', { status: 503, statusText: 'Service Unavailable' }))
    );
});

// Background sync for data updates
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Implement background sync logic here
            console.log('Background sync triggered')
        );
    }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'New update available',
            icon: '/pirate.png',
            badge: '/pirate.png',
            vibrate: [200, 100, 200],
            data: data.data || {},
            actions: [
                {
                    action: 'view',
                    title: 'View',
                    icon: '/pirate.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Blocksense Monitor', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});