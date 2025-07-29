// Tripesa Safari Marketplace Service Worker
// Version 1.0.0

const CACHE_NAME = 'tripesa-safari-v1';
const OFFLINE_PAGE = '/offline';
const TOURS_CACHE = 'tripesa-tours-v1';
const IMAGES_CACHE = 'tripesa-images-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/tours',
    '/manifest.json',
    '/logo.png',
    // Add your critical CSS and JS files here
];

// Safari animals for fun offline experience
const SAFARI_ANIMALS = ['🦁', '🐘', '🦒', '🦓', '🦏', '🐆', '🐃', '🦘', '🐊', '🦜'];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('🎯 Safari Service Worker installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching static assets for safari adventure');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Safari base camp established!');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Failed to set up safari base camp:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Safari Service Worker activated!');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== TOURS_CACHE && cacheName !== IMAGES_CACHE) {
                            console.log('🧹 Cleaning up old safari cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('🏕️ Safari camp is ready for adventure!');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle different types of requests with different strategies
    if (url.pathname.startsWith('/api/tours')) {
        // Tours API - Network first with cache fallback
        event.respondWith(handleToursAPI(request));
    } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        // Images - Cache first with network fallback
        event.respondWith(handleImages(request));
    } else if (url.pathname === '/' || url.pathname.startsWith('/tours')) {
        // Main pages - Stale while revalidate
        event.respondWith(handlePages(request));
    } else {
        // Everything else - Network first
        event.respondWith(handleGeneral(request));
    }
});

// Handle tours API requests
async function handleToursAPI(request) {
    const cache = await caches.open(TOURS_CACHE);

    try {
        // Try network first
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache successful response
            await cache.put(request, networkResponse.clone());

            // Add safari notification
            broadcastToClients({
                type: 'TOURS_UPDATED',
                message: '🦁 Fresh safari tours loaded!',
                animal: getRandomAnimal()
            });
        }

        return networkResponse;
    } catch (error) {
        console.log('🔌 Network unavailable, serving cached safari tours');

        // Try cache
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            // Show offline notification
            broadcastToClients({
                type: 'OFFLINE_MODE',
                message: '🏕️ Showing cached safari adventures',
                animal: getRandomAnimal()
            });

            return cachedResponse;
        }

        // Return offline page if no cache
        return caches.match(OFFLINE_PAGE);
    }
}

// Handle images
async function handleImages(request) {
    const cache = await caches.open(IMAGES_CACHE);

    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        // Fetch from network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Return placeholder for missing images
        return new Response(
            `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="45%" text-anchor="middle" fill="#6b7280" font-size="16">
          🏞️ Safari Image
        </text>
        <text x="50%" y="65%" text-anchor="middle" fill="#9ca3af" font-size="12">
          Available when online
        </text>
      </svg>`,
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
}

// Handle pages
async function handlePages(request) {
    const cache = await caches.open(CACHE_NAME);

    try {
        // Try network first
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Ultimate fallback to offline page
        return caches.match(OFFLINE_PAGE);
    }
}

// Handle general requests
async function handleGeneral(request) {
    try {
        return await fetch(request);
    } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        return cachedResponse || caches.match(OFFLINE_PAGE);
    }
}

// Utility functions
function getRandomAnimal() {
    return SAFARI_ANIMALS[Math.floor(Math.random() * SAFARI_ANIMALS.length)];
}

function broadcastToClients(message) {
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage(message);
        });
    });
}

// Background sync for when connection returns
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Connection restored! Syncing safari data...');

        event.waitUntil(
            // Refresh tours data when back online
            fetch('/api/tours')
                .then(() => {
                    broadcastToClients({
                        type: 'BACK_ONLINE',
                        message: '🌐 Back online! Safari adventures updated!',
                        animal: '🎉'
                    });
                })
                .catch(() => {
                    console.log('🔌 Still offline, will try again later');
                })
        );
    }
});

// Push notifications (optional - for safari deal alerts)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body || 'New safari adventure awaits!',
            icon: '/logo.png',
            badge: '/logo.png',
            vibrate: [200, 100, 200],
            data: data.url || '/',
            actions: [
                {
                    action: 'explore',
                    title: 'Explore Safari 🦁',
                    icon: '/logo.png'
                },
                {
                    action: 'close',
                    title: 'Close'
                }
            ],
            tag: 'safari-notification',
            requireInteraction: false
        };

        event.waitUntil(
            self.registration.showNotification(
                data.title || '🏕️ Tripesa Safari Adventures',
                options
            )
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow(event.notification.data || '/')
        );
    }
});

console.log('🦁 Tripesa Safari Service Worker loaded and ready for adventure!'); 