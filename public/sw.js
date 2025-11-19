// const CACHE_VERSION = 'v1.0.0';
// const CACHE_NAME = `app-cache-${CACHE_VERSION}`;

// // Files to cache immediately on install
// const PRECACHE_URLS = [
//   '/',
//   '/manifest.json',
// ];

// // Install event - cache essential files
// self.addEventListener('install', (event) => {
//   console.log('[ServiceWorker] Installing...');
  
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       console.log('[ServiceWorker] Precaching app shell');
//       return cache.addAll(PRECACHE_URLS);
//     }).then(() => {
//       return self.skipWaiting();
//     })
//   );
// });

// self.addEventListener('activate', (event) => {  
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheName !== CACHE_NAME) {
//             console.log('[ServiceWorker] Deleting old cache:', cacheName);
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     }).then(() => {
//       return self.clients.claim();
//     })
//   );
// });

// // Fetch event - serve from cache, fallback to network
// self.addEventListener('fetch', (event) => {
//   const { request } = event;
//   const url = new URL(request.url);

//   // Skip chrome extensions and non-http(s) requests
//   if (!url.protocol.startsWith('http')) {
//     return;
//   }

//   // Handle API requests with Network First strategy
//   if (url.pathname.startsWith('/api/')) {
//     event.respondWith(
//       fetch(request)
//         .then((response) => {
//           // Only cache successful GET requests
//           if (request.method === 'GET' && response.status === 200) {
//             const responseToCache = response.clone();
//             caches.open(CACHE_NAME).then((cache) => {
//               cache.put(request, responseToCache);
//             });
//           }
//           return response;
//         })
//         .catch(() => {
//           // Return cached response if available
//           return caches.match(request).then((cachedResponse) => {
//             if (cachedResponse) {
//               return cachedResponse;
//             }
//             // Return offline page for navigation requests
//             if (request.mode === 'navigate') {
//               return caches.match('/offline.html');
//             }
//             return new Response('Network error', {
//               status: 408,
//               headers: { 'Content-Type': 'text/plain' },
//             });
//           });
//         })
//     );
//     return;
//   }

//   // Handle image requests with Cache First strategy
//   if (request.destination === 'image') {
//     event.respondWith(
//       caches.match(request).then((cachedResponse) => {
//         if (cachedResponse) {
//           return cachedResponse;
//         }
//         return fetch(request).then((response) => {
//           if (response.status === 200) {
//             const responseToCache = response.clone();
//             caches.open(CACHE_NAME).then((cache) => {
//               cache.put(request, responseToCache);
//             });
//           }
//           return response;
//         });
//       })
//     );
//     return;
//   }

//   // Handle CSS and JS with Stale While Revalidate
//   if (
//     request.destination === 'style' ||
//     request.destination === 'script' ||
//     url.pathname.endsWith('.css') ||
//     url.pathname.endsWith('.js')
//   ) {
//     event.respondWith(
//       caches.match(request).then((cachedResponse) => {
//         const fetchPromise = fetch(request).then((response) => {
//           if (response.status === 200) {
//             const responseToCache = response.clone();
//             caches.open(CACHE_NAME).then((cache) => {
//               cache.put(request, responseToCache);
//             });
//           }
//           return response;
//         });
//         return cachedResponse || fetchPromise;
//       })
//     );
//     return;
//   }

//   // Handle navigation requests (pages)
//   if (request.mode === 'navigate') {
//     event.respondWith(
//       fetch(request)
//         .then((response) => {
//           const responseToCache = response.clone();
//           caches.open(CACHE_NAME).then((cache) => {
//             cache.put(request, responseToCache);
//           });
//           return response;
//         })
//         .catch(() => {
//           return caches.match(request).then((cachedResponse) => {
//             return cachedResponse || caches.match('/offline.html');
//           });
//         })
//     );
//     return;
//   }

//   // Default: try network first, then cache
//   event.respondWith(
//     fetch(request)
//       .then((response) => {
//         if (response.status === 200 && request.method === 'GET') {
//           const responseToCache = response.clone();
//           caches.open(CACHE_NAME).then((cache) => {
//             cache.put(request, responseToCache);
//           });
//         }
//         return response;
//       })
//       .catch(() => {
//         return caches.match(request);
//       })
//   );
// });

// // Listen for messages from the client
// self.addEventListener('message', (event) => {
//   if (event.data && event.data.type === 'SKIP_WAITING') {
//     self.skipWaiting();
//   }
  
//   if (event.data && event.data.type === 'CACHE_URLS') {
//     event.waitUntil(
//       caches.open(CACHE_NAME).then((cache) => {
//         return cache.addAll(event.data.payload);
//       })
//     );
//   }
// });







const CACHE_VERSION = 'v1.0.3';
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-cache-${CACHE_VERSION}`;
const TIMEOUT_MS = 2000; // Reduced timeout for faster offline detection

// Files to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/market',
  '/investors',
  '/courses',
  '/dashboard',
  '/dashboard/*',
  '/apply'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Precaching app shell');
        return cache.addAll(PRECACHE_URLS).catch((error) => {
          console.error('[ServiceWorker] Precache failed:', error);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Helper: Check if we're online
async function isOnline() {
  if (!navigator.onLine) return false;
  
  try {
    const response = await fetch('/manifest.json', {
      method: 'HEAD',
      cache: 'no-store'
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Helper: Race between network and timeout
function fetchWithTimeout(request, timeout = TIMEOUT_MS) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
}

// Fetch event - optimized for instant offline navigation
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip Next.js internal requests (let them pass through)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/__nextjs') ||
    url.pathname.includes('/api/auth/') ||
    url.pathname === '/api/revalidate' ||
    url.searchParams.has('_rsc')
  ) {
    return;
  }

  // Handle navigation requests (pages) - OPTIMIZED FOR SPEED
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        // First check if we have it in cache
        const cachedResponse = await caches.match(request);
        
        // If offline, serve from cache immediately
        if (!navigator.onLine && cachedResponse) {
          console.log('[ServiceWorker] Offline - serving from cache:', url.pathname);
          return cachedResponse;
        }
        
        try {
          // Try network with short timeout
          const networkResponse = await fetchWithTimeout(request, TIMEOUT_MS);
          
          // Cache successful responses
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          
          return networkResponse;
        } catch (error) {
          console.log('[ServiceWorker] Network failed, using cache:', url.pathname);
          
          // Network failed - serve from cache
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Try offline page
          const offlinePage = await caches.match('/offline');
          if (offlinePage) {
            return offlinePage;
          }
          
          // Try homepage as fallback
          const homePage = await caches.match('/');
          if (homePage) {
            return homePage;
          }
          
          // Final fallback: inline HTML
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Offline</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  color: white;
                  padding: 20px;
                }
                .container {
                  text-align: center;
                  max-width: 500px;
                  animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .icon {
                  font-size: 4rem;
                  margin-bottom: 1.5rem;
                  animation: pulse 2s infinite;
                }
                @keyframes pulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.1); }
                }
                h1 {
                  font-size: 2.5rem;
                  margin-bottom: 1rem;
                  font-weight: 700;
                }
                p {
                  font-size: 1.1rem;
                  margin-bottom: 2rem;
                  opacity: 0.95;
                  line-height: 1.6;
                }
                button {
                  background: white;
                  color: #10b981;
                  border: none;
                  padding: 14px 32px;
                  font-size: 1rem;
                  border-radius: 12px;
                  cursor: pointer;
                  font-weight: 600;
                  transition: all 0.2s;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                }
                button:active {
                  transform: translateY(0);
                }
                .tip {
                  margin-top: 2rem;
                  font-size: 0.9rem;
                  opacity: 0.8;
                  background: rgba(255,255,255,0.1);
                  padding: 12px;
                  border-radius: 8px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">📡</div>
                <h1>You're Offline</h1>
                <p>
                  No internet connection detected. Pages you've previously 
                  visited are still available in your cache.
                </p>
                <button onclick="location.reload()">🔄 Try Again</button>
                <div class="tip">
                  💡 Your connection will be restored automatically when back online
                </div>
              </div>
              <script>
                // Auto-reload when back online
                window.addEventListener('online', () => {
                  console.log('Back online!');
                  setTimeout(() => location.reload(), 500);
                });
                
                // Show online status
                setInterval(() => {
                  if (navigator.onLine) {
                    location.reload();
                  }
                }, 3000);
              </script>
            </body>
            </html>`,
            {
              status: 200,
              headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-store'
              }
            }
          );
        }
      })()
    );
    return;
  }

  // Handle API requests - Fast timeout with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        // If offline, serve from cache immediately
        if (!navigator.onLine) {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            JSON.stringify({ error: 'Offline', offline: true }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        
        try {
          const response = await fetchWithTimeout(request, TIMEOUT_MS);
          
          // Cache successful GET requests
          if (request.method === 'GET' && response.ok) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          
          return response;
        } catch (error) {
          // Try cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return new Response(
            JSON.stringify({ error: 'Network error', offline: true }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      })()
    );
    return;
  }

  // Handle images - Cache First for instant loading
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i)
  ) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        try {
          const response = await fetch(request);
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        } catch {
          return new Response('', { status: 404 });
        }
      })()
    );
    return;
  }

  // Handle CSS and JS - Cache First with background update
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.match(/\.(css|js)$/i)
  ) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);
        
        // Serve cache immediately
        if (cachedResponse) {
          // Update in background
          fetch(request).then((response) => {
            if (response.ok) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, response);
              });
            }
          }).catch(() => {});
          
          return cachedResponse;
        }
        
        // No cache, fetch from network
        const response = await fetch(request);
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })()
    );
    return;
  }

  // Default: network with cache fallback
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response.ok && request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      } catch {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline', { status: 503 });
      }
    })()
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.payload).catch((error) => {
          console.error('[ServiceWorker] Failed to cache URLs:', error);
        });
      })
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});