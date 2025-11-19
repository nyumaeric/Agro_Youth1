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








// const CACHE_VERSION = 'v1.0.0';
// const CACHE_NAME = `app-cache-${CACHE_VERSION}`;
// const RUNTIME_CACHE = `runtime-cache-${CACHE_VERSION}`;

// // Files to cache immediately on install
// const PRECACHE_URLS = [
//   '/',
//   '/manifest.json',
// ];

// // Install event - cache essential files
// self.addEventListener('install', (event) => {
//   console.log('[ServiceWorker] Installing...');
  
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => {
//         console.log('[ServiceWorker] Precaching app shell');
//         return cache.addAll(PRECACHE_URLS).catch((error) => {
//           console.error('[ServiceWorker] Precache failed:', error);
//           // Continue even if some files fail to cache
//         });
//       })
//       .then(() => {
//         return self.skipWaiting();
//       })
//   );
// });

// self.addEventListener('activate', (event) => {
//   console.log('[ServiceWorker] Activating...');
  
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
//             console.log('[ServiceWorker] Deleting old cache:', cacheName);
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     }).then(() => {
//       console.log('[ServiceWorker] Claiming clients');
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

//   // Skip Next.js internal requests
//   if (
//     url.pathname.startsWith('/_next/') ||
//     url.pathname.includes('/api/auth/') ||
//     url.pathname === '/api/revalidate'
//   ) {
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
//             caches.open(RUNTIME_CACHE).then((cache) => {
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
//             // Return a proper offline response for API calls
//             return new Response(
//               JSON.stringify({
//                 error: 'You are offline. Please check your connection.',
//                 offline: true
//               }),
//               {
//                 status: 503,
//                 statusText: 'Service Unavailable',
//                 headers: { 
//                   'Content-Type': 'application/json',
//                   'Cache-Control': 'no-store'
//                 },
//               }
//             );
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
//             caches.open(RUNTIME_CACHE).then((cache) => {
//               cache.put(request, responseToCache);
//             });
//           }
//           return response;
//         }).catch(() => {
//           // Return a placeholder image or empty response
//           return new Response('', { status: 404 });
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
//         const fetchPromise = fetch(request)
//           .then((response) => {
//             if (response.status === 200) {
//               const responseToCache = response.clone();
//               caches.open(RUNTIME_CACHE).then((cache) => {
//                 cache.put(request, responseToCache);
//               });
//             }
//             return response;
//           })
//           .catch(() => cachedResponse);
        
//         return cachedResponse || fetchPromise;
//       })
//     );
//     return;
//   }

//   // Handle navigation requests (pages) - CRITICAL FIX
//   if (request.mode === 'navigate') {
//     event.respondWith(
//       fetch(request)
//         .then((response) => {
//           // Only cache successful responses
//           if (response.status === 200) {
//             const responseToCache = response.clone();
//             caches.open(RUNTIME_CACHE).then((cache) => {
//               cache.put(request, responseToCache);
//             });
//           }
//           return response;
//         })
//         .catch(() => {
//           // First try to find the exact page in cache
//           return caches.match(request)
//             .then((cachedResponse) => {
//               if (cachedResponse) {
//                 return cachedResponse;
//               }
              
//               // If not found, try to serve the offline page
//               return caches.match('/offline')
//                 .then((offlinePage) => {
//                   if (offlinePage) {
//                     return offlinePage;
//                   }
                  
//                   // Last resort: serve the homepage if available
//                   return caches.match('/')
//                     .then((homePage) => {
//                       if (homePage) {
//                         return homePage;
//                       }
                      
//                       // Final fallback: create a simple offline HTML response
//                       return new Response(
//                         `<!DOCTYPE html>
//                         <html lang="en">
//                         <head>
//                           <meta charset="UTF-8">
//                           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                           <title>Offline</title>
//                           <style>
//                             body {
//                               font-family: system-ui, -apple-system, sans-serif;
//                               display: flex;
//                               align-items: center;
//                               justify-content: center;
//                               min-height: 100vh;
//                               margin: 0;
//                               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                               color: white;
//                               text-align: center;
//                               padding: 20px;
//                             }
//                             .container {
//                               max-width: 500px;
//                             }
//                             h1 {
//                               font-size: 3rem;
//                               margin-bottom: 1rem;
//                             }
//                             p {
//                               font-size: 1.2rem;
//                               margin-bottom: 2rem;
//                               opacity: 0.9;
//                             }
//                             button {
//                               background: white;
//                               color: #667eea;
//                               border: none;
//                               padding: 12px 24px;
//                               font-size: 1rem;
//                               border-radius: 8px;
//                               cursor: pointer;
//                               font-weight: 600;
//                             }
//                             button:hover {
//                               transform: scale(1.05);
//                             }
//                           </style>
//                         </head>
//                         <body>
//                           <div class="container">
//                             <h1>📡</h1>
//                             <h1>You're Offline</h1>
//                             <p>It looks like you've lost your internet connection. Please check your network and try again.</p>
//                             <button onclick="location.reload()">Retry</button>
//                           </div>
//                         </body>
//                         </html>`,
//                         {
//                           status: 200,
//                           statusText: 'OK',
//                           headers: {
//                             'Content-Type': 'text/html',
//                             'Cache-Control': 'no-store'
//                           }
//                         }
//                       );
//                     });
//                 });
//             });
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
//           caches.open(RUNTIME_CACHE).then((cache) => {
//             cache.put(request, responseToCache);
//           });
//         }
//         return response;
//       })
//       .catch(() => {
//         return caches.match(request).then((cachedResponse) => {
//           return cachedResponse || new Response('Offline', { status: 503 });
//         });
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
//       caches.open(RUNTIME_CACHE).then((cache) => {
//         return cache.addAll(event.data.payload).catch((error) => {
//           console.error('[ServiceWorker] Failed to cache URLs:', error);
//         });
//       })
//     );
//   }
  
//   if (event.data && event.data.type === 'CLEAR_CACHE') {
//     event.waitUntil(
//       caches.keys().then((cacheNames) => {
//         return Promise.all(
//           cacheNames.map((cacheName) => caches.delete(cacheName))
//         );
//       })
//     );
//   }
// });
const CACHE_VERSION = 'v1.0.2';
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-cache-${CACHE_VERSION}`;

// Files to cache immediately on install
const PRECACHE_URLS = [
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
    }).then(() => self.clients.claim())
  );
});

// Helper function to check if request is for a page
function isPageRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

// Helper function to check if should skip caching
function shouldSkipCache(url) {
  return url.pathname.startsWith('/_next/') ||
         url.pathname.startsWith('/__nextjs') ||
         url.pathname === '/_error' ||
         url.searchParams.has('_rsc') ||
         url.pathname.includes('/api/auth/');
}

// Fetch event - balanced for speed AND offline support
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip Next.js internal requests (but not navigation)
  if (shouldSkipCache(url) && !isPageRequest(request)) {
    return;
  }

  // Handle navigation requests (pages) - Network First with offline fallback
  if (isPageRequest(request)) {
    event.respondWith(
      fetch(request, { 
        cache: 'no-store' // Prevent browser cache for fresh content
      })
        .then((response) => {
          // Cache successful page loads for offline access
          if (response.ok && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('[ServiceWorker] Fetch failed for:', url.pathname);
          
          // Try to serve from cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[ServiceWorker] Serving from cache:', url.pathname);
              return cachedResponse;
            }
            
            // Serve offline page as fallback
            console.log('[ServiceWorker] Serving offline page');
            return caches.match('/offline').then((offlinePage) => {
              if (offlinePage) {
                return offlinePage;
              }
              
              // Final fallback: inline HTML
              return new Response(
                `<!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Offline - Agro Youth</title>
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 20px;
                    }
                    .container {
                      text-align: center;
                      max-width: 500px;
                      background: rgba(255, 255, 255, 0.1);
                      padding: 40px;
                      border-radius: 20px;
                      backdrop-filter: blur(10px);
                    }
                    .icon {
                      font-size: 4rem;
                      margin-bottom: 20px;
                    }
                    h1 {
                      font-size: 2.5rem;
                      margin-bottom: 15px;
                    }
                    p {
                      font-size: 1.1rem;
                      margin-bottom: 30px;
                      opacity: 0.9;
                      line-height: 1.6;
                    }
                    button {
                      background: white;
                      color: #667eea;
                      border: none;
                      padding: 15px 30px;
                      font-size: 1rem;
                      border-radius: 10px;
                      cursor: pointer;
                      font-weight: 600;
                      transition: transform 0.2s;
                    }
                    button:hover {
                      transform: scale(1.05);
                    }
                    button:active {
                      transform: scale(0.98);
                    }
                    .help {
                      margin-top: 20px;
                      font-size: 0.9rem;
                      opacity: 0.7;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="icon">📡</div>
                    <h1>You're Offline</h1>
                    <p>
                      It looks like you've lost your internet connection. 
                      Some pages you've visited before might still be available.
                    </p>
                    <button onclick="location.reload()">
                      🔄 Try Again
                    </button>
                    <div class="help">
                      Check your network connection and try refreshing the page
                    </div>
                  </div>
                  <script>
                    // Auto-reload when back online
                    window.addEventListener('online', () => {
                      setTimeout(() => location.reload(), 1000);
                    });
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
            });
          });
        })
    );
    return;
  }

  // Handle API requests - Network First with timeout
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      Promise.race([
        fetch(request).then((response) => {
          if (request.method === 'GET' && response.ok) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 5000)
        )
      ]).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || new Response(
            JSON.stringify({
              error: 'You are offline. Please check your connection.',
              offline: true
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        });
      })
    );
    return;
  }

  // Handle static assets (images, fonts) - Cache First
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // For CSS and JS - Stale While Revalidate (fast + offline support)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.match(/\.(css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => cachedResponse);
        
        // Return cache immediately, update in background
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
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
  
  if (event.data && event.data.type === 'CACHE_CURRENT_PAGE') {
    event.waitUntil(
      clients.get(event.source.id).then((client) => {
        if (client) {
          return fetch(client.url).then((response) => {
            return caches.open(RUNTIME_CACHE).then((cache) => {
              return cache.put(client.url, response);
            });
          });
        }
      })
    );
  }
});