/* ========================================
   1klive Service Worker
   Version: 1.2.1 - Fixed Reload Loop
   ======================================== */

const CACHE_NAME = '1klive-v1.2.1';
const RUNTIME_CACHE = '1klive-runtime-v1.2';

// Keep Service Worker alive
let keepAliveInterval = null;

// ไฟล์ที่ต้อง cache ทันที
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

// ========================================
// Install Event - Cache ไฟล์สำคัญ
// ========================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v1.2.1...');
  
  // Don't skip waiting - let it wait until next page load
  // This prevents reload loop
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Precaching complete');
      })
      .catch((error) => {
        console.error('[SW] Precaching failed:', error);
      })
  );
});

// ========================================
// Activate Event - ลบ cache เก่า
// ========================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v1.2.1...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // ลบ cache ที่ไม่ใช่เวอร์ชันปัจจุบัน
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ])
      .then(() => {
        console.log('[SW] Service Worker activated successfully');
        console.log('[SW] All clients claimed');
        
        // Start keep-alive after activation is complete
        // Delay 5 seconds to ensure everything is ready
        setTimeout(() => {
          startKeepAlive();
        }, 5000);
      })
      .catch(error => {
        console.error('[SW] Activation error:', error);
      })
  );
});

// ========================================
// 🔄 Keep-Alive Mechanism
// ========================================
function startKeepAlive() {
  // Stop existing interval first
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  // Send periodic heartbeat to keep SW alive
  keepAliveInterval = setInterval(() => {
    try {
      console.log('[SW] Heartbeat - keeping alive');
      
      // Ping all clients to maintain connection
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then(clients => {
          if (clients.length > 0) {
            clients.forEach(client => {
              try {
                client.postMessage({
                  type: 'HEARTBEAT',
                  timestamp: Date.now()
                });
              } catch (e) {
                console.warn('[SW] Failed to send heartbeat to client:', e);
              }
            });
          }
        })
        .catch(err => {
          console.warn('[SW] Heartbeat error:', err);
        });
    } catch (error) {
      console.error('[SW] Keep-alive error:', error);
    }
  }, 30000); // Every 30 seconds (less aggressive)
  
  console.log('[SW] Keep-alive mechanism started (30s interval)');
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('[SW] Keep-alive mechanism stopped');
  }
}

// ========================================
// Fetch Event - Network First with Cache Fallback
// ========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ข้าม chrome-extension และ non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // ข้าม API requests - ไม่ cache
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Network First Strategy สำหรับ HTML
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response และเก็บใน cache
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // ถ้า network fail ให้ใช้ cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // ถ้าไม่มี cache ให้ return offline page
              return caches.match('/index.html');
            });
        })
    );
    return;
  }

  // Cache First Strategy สำหรับ assets อื่นๆ
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // ถ้าไม่มี cache ให้ fetch และเก็บใน cache
        return fetch(request)
          .then((response) => {
            // ตรวจสอบว่า response ถูกต้อง
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone และเก็บใน runtime cache
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            // Return a fallback response if needed
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// ========================================
// Push Notification Event
// ========================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let notificationData = {
    title: '1klive',
    body: 'คุณมีการแจ้งเตือนใหม่',
    icon: '/logo.png',
    badge: '/logo.png',
    data: {
      url: 'https://1klive.com'
    }
  };

  // Parse notification data
  if (event.data) {
    try {
      notificationData = event.data.json();
      console.log('[SW] Notification data:', notificationData);
    } catch (e) {
      console.log('[SW] Using default notification');
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/logo.png',
    badge: notificationData.badge || '/logo.png',
    vibrate: [200, 100, 200],
    tag: 'notification-' + Date.now(),
    requireInteraction: false,
    renotify: true, // Show notification even if one exists
    silent: false,
    data: notificationData.data || { url: 'https://1klive.com' },
    actions: [
      {
        action: 'open',
        title: 'เปิดดู',
        icon: '/logo.png'
      },
      {
        action: 'close',
        title: 'ปิด'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
      .then(() => {
        console.log('[SW] Notification shown successfully');
        
        // Wake up all clients
        return self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      })
      .then(clients => {
        if (clients.length > 0) {
          console.log('[SW] Notifying', clients.length, 'clients');
          clients.forEach(client => {
            try {
              client.postMessage({
                type: 'NOTIFICATION_RECEIVED',
                data: notificationData
              });
            } catch (e) {
              console.warn('[SW] Failed to notify client:', e);
            }
          });
        }
      })
      .catch((error) => {
        console.error('[SW] Notification error:', error);
      })
  );
});

// ========================================
// Notification Click Event
// ========================================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();

  if (event.action === 'close') {
    console.log('[SW] Notification closed by user');
    return;
  }

  // เปิด URL ที่ระบุใน notification
  const urlToOpen = event.notification.data?.url || 'https://1klive.com';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // ตรวจสอบว่ามี window ที่เปิดอยู่แล้วหรือไม่
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            console.log('[SW] Focusing existing window');
            return client.focus();
          }
        }
        
        // ถ้าไม่มี window ที่เปิดอยู่ ให้เปิดใหม่
        if (clients.openWindow) {
          console.log('[SW] Opening new window:', urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('[SW] Error handling notification click:', error);
      })
  );
});

// ========================================
// Background Sync (Optional - for future use)
// ========================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Sync logic here
      Promise.resolve()
    );
  }
});

// ========================================
// Message Event (Communication with app)
// ========================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting...');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches...');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// ========================================
// Error Handling
// ========================================
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] Service Worker loaded');