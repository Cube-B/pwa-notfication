// เฮงเฮง888 Service Worker v2.1.0
const VERSION = '2.1.0';
const CACHE_NAME = `hengheng888-v${VERSION}`;
const RUNTIME_CACHE = `hengheng888-runtime-v${VERSION}`;

// Files to cache
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/icon-192.png',
    '/icon-512.png'
];

// Install event
self.addEventListener('install', (event) => {
    console.log(`🔧 SW ${VERSION} installing...`);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log(`📦 Caching v${VERSION}`);
                return cache.addAll(PRECACHE_URLS.map(url => new Request(url, {cache: 'reload'})));
            })
            .catch(err => {
                console.error('Cache error:', err);
                return Promise.resolve();
            })
            .then(() => {
                console.log(`✅ SW ${VERSION} installed, skipping waiting...`);
                return self.skipWaiting();  // ⚠️ สำคัญ: Force activate ทันที!
            })
    );
});

// Activate event - ลบ cache เก่า
self.addEventListener('activate', (event) => {
    console.log(`🚀 SW ${VERSION} activating...`);
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log(`🗑️ Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log(`✅ SW ${VERSION} activated`);
            return self.clients.claim();  // ⚠️ สำคัญ: ควบคุม client ทันที!
        })
        .then(() => {
            // แจ้ง clients ทั้งหมดว่ามีเวอร์ชันใหม่
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        version: VERSION,
                        message: `อัปเดตเป็นเวอร์ชัน ${VERSION} แล้ว`
                    });
                });
            });
        })
    );
});

// Fetch event - Cache-first strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) {
                    return cached;
                }
                
                return fetch(request).then(response => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                });
            })
            .catch(err => {
                console.error('Fetch failed:', err);
                return caches.match('/offline.html');
            })
    );
});

// Push notification handler
self.addEventListener('push', (event) => {
    console.log(`🔔 Push received (SW v${VERSION})`);
    
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'เฮงเฮง888', body: event.data.text() };
        }
    }
    
    const options = {
        body: data.body || 'คุณมีการแจ้งเตือนใหม่',
        icon: data.icon || '/icon-192.png',
        badge: data.badge || '/icon-192.png',
        vibrate: [200, 100, 200, 100, 200],
        data: data.data || {},
        tag: 'hengheng888-' + Date.now(),
        requireInteraction: false
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'เฮงเฮง888', options)
            .then(() => {
                console.log(`✅ Notification shown (SW v${VERSION})`);
            })
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked');
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Message handler
self.addEventListener('message', (event) => {
    console.log('💬 Message received:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: VERSION });
    }
});

console.log(`✅ Service Worker v${VERSION} loaded`);
