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








const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-cache-${CACHE_VERSION}`;

// Files to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
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
          // Continue even if some files fail to cache
        });
      })
      .then(() => {
        return self.skipWaiting();
      })
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

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome extensions and non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip Next.js internal requests
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('/api/auth/') ||
    url.pathname === '/api/revalidate'
  ) {
    return;
  }

  // Handle API requests with Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return a proper offline response for API calls
            return new Response(
              JSON.stringify({
                error: 'You are offline. Please check your connection.',
                offline: true
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-store'
                },
              }
            );
          });
        })
    );
    return;
  }

  // Handle image requests with Cache First strategy
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // Return a placeholder image or empty response
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // Handle CSS and JS with Stale While Revalidate
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => cachedResponse);
        
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Handle navigation requests (pages) - CRITICAL FIX
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // First try to find the exact page in cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If not found, try to serve the offline page
              return caches.match('/offline')
                .then((offlinePage) => {
                  if (offlinePage) {
                    return offlinePage;
                  }
                  
                  // Last resort: serve the homepage if available
                  return caches.match('/')
                    .then((homePage) => {
                      if (homePage) {
                        return homePage;
                      }
                      
                      // Final fallback: create a simple offline HTML response
                      return new Response(
                        `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <title>Offline</title>
                          <style>
                            body {
                              font-family: system-ui, -apple-system, sans-serif;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              min-height: 100vh;
                              margin: 0;
                              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              color: white;
                              text-align: center;
                              padding: 20px;
                            }
                            .container {
                              max-width: 500px;
                            }
                            h1 {
                              font-size: 3rem;
                              margin-bottom: 1rem;
                            }
                            p {
                              font-size: 1.2rem;
                              margin-bottom: 2rem;
                              opacity: 0.9;
                            }
                            button {
                              background: white;
                              color: #667eea;
                              border: none;
                              padding: 12px 24px;
                              font-size: 1rem;
                              border-radius: 8px;
                              cursor: pointer;
                              font-weight: 600;
                            }
                            button:hover {
                              transform: scale(1.05);
                            }
                          </style>
                        </head>
                        <body>
                          <div class="container">
                            <h1>📡</h1>
                            <h1>You're Offline</h1>
                            <p>It looks like you've lost your internet connection. Please check your network and try again.</p>
                            <button onclick="location.reload()">Retry</button>
                          </div>
                        </body>
                        </html>`,
                        {
                          status: 200,
                          statusText: 'OK',
                          headers: {
                            'Content-Type': 'text/html',
                            'Cache-Control': 'no-store'
                          }
                        }
                      );
                    });
                });
            });
        })
    );
    return;
  }

  // Default: try network first, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200 && request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || new Response('Offline', { status: 503 });
        });
      })
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