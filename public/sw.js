// const CACHE_VERSION = 'v1.0.6';
// const CACHE_NAME = `app-cache-${CACHE_VERSION}`;
// const RUNTIME_CACHE = `runtime-cache-${CACHE_VERSION}`;
// const TIMEOUT_MS = 2000;

// const PRECACHE_URLS = [
//   '/',
//   '/manifest.json',
//   '/market',
//   '/investors',
//   '/courses',
//   '/dashboard',
//   '/dashboard/*',
//   '/apply',
// ];

// self.addEventListener('install', (event) => {
//   console.log('[ServiceWorker] Installing...');
  
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => {
//         console.log('[ServiceWorker] Precaching app shell');
//         return cache.addAll(PRECACHE_URLS).catch((error) => {
//           console.error('[ServiceWorker] Precache failed:', error);
//         });
//       })
//       .then(() => self.skipWaiting())
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

// // Helper: Race between network and timeout
// function fetchWithTimeout(request, timeout = TIMEOUT_MS) {
//   return Promise.race([
//     fetch(request),
//     new Promise((_, reject) => 
//       setTimeout(() => reject(new Error('Network timeout')), timeout)
//     )
//   ]);
// }

// // Fetch event - optimized for instant offline navigation
// self.addEventListener('fetch', (event) => {
//   const { request } = event;
//   const url = new URL(request.url);

//   // Skip non-http(s) requests
//   if (!url.protocol.startsWith('http')) {
//     return;
//   }

//   // Only skip these specific Next.js internals:
//   if (
//     url.pathname.startsWith('/__nextjs') ||
//     url.pathname.includes('/api/auth/') ||
//     url.pathname === '/api/revalidate'
//   ) {
//     return;
//   }

//   // Handle _next/static files (JS, CSS, chunks) - CRITICAL FOR OFFLINE
//   if (url.pathname.startsWith('/_next/static/')) {
//     event.respondWith(
//       (async () => {
//         // Cache first for static assets (they're immutable with hashed names)
//         const cachedResponse = await caches.match(request);
//         if (cachedResponse) {
//           console.log('[ServiceWorker] Serving static asset from cache:', url.pathname);
//           return cachedResponse;
//         }
        
//         try {
//           const response = await fetch(request);
//           if (response.ok) {
//             const responseToCache = response.clone();
//             caches.open(RUNTIME_CACHE).then((cache) => {
//               console.log('[ServiceWorker] Caching static asset:', url.pathname);
//               cache.put(request, responseToCache);
//             });
//           }
//           return response;
//         } catch (error) {
//           console.error('[ServiceWorker] Failed to fetch static asset:', url.pathname);
//           return new Response('', { status: 404 });
//         }
//       })()
//     );
//     return;
//   }

//   // Handle _next/data (RSC data for App Router) - CRITICAL FOR OFFLINE
//   if (url.pathname.startsWith('/_next/data/') || url.searchParams.has('_rsc')) {
//     event.respondWith(
//       (async () => {
//         const cachedResponse = await caches.match(request);
        
//         if (!navigator.onLine && cachedResponse) {
//           console.log('[ServiceWorker] Serving data from cache:', url.pathname);
//           return cachedResponse;
//         }
        
//         try {
//           const response = await fetchWithTimeout(request, TIMEOUT_MS);
//           if (response.ok) {
//             const responseToCache = response.clone();
//             caches.open(RUNTIME_CACHE).then((cache) => {
//               console.log('[ServiceWorker] Caching data:', url.pathname);
//               cache.put(request, responseToCache);
//             });
//           }
//           return response;
//         } catch (error) {
//           if (cachedResponse) {
//             console.log('[ServiceWorker] Network failed, using cached data');
//             return cachedResponse;
//           }
//           // Return minimal valid response
//           return new Response('null', {
//             status: 200,
//             headers: { 'Content-Type': 'application/json' }
//           });
//         }
//       })()
//     );
//     return;
//   }

//   // Handle navigation requests (pages) - ALL ROUTES GET SAME HTML (SPA SHELL)
//   if (request.mode === 'navigate') {
//     event.respondWith(
//       (async () => {
//         console.log('[ServiceWorker] Navigation request for:', url.pathname);
        
//         // If offline, serve the app shell from cache immediately
//         if (!navigator.onLine) {
//           console.log('[ServiceWorker] OFFLINE - Serving app shell for:', url.pathname);
          
//           // Try to get cached version of this exact route first
//           let cachedResponse = await caches.match(request);
          
//           // If not found, serve the root HTML (app shell) - Next.js router will handle routing
//           if (!cachedResponse) {
//             console.log('[ServiceWorker] Route not cached, serving app shell from /');
//             cachedResponse = await caches.match('/');
//           }
          
//           if (cachedResponse) {
//             return cachedResponse;
//           }
          
//           // This should never happen if / is precached
//           console.error('[ServiceWorker] No app shell found in cache!');
//           return new Response('App not available offline', { status: 503 });
//         }
        
//         try {
//           // Online - try network with timeout
//           console.log('[ServiceWorker] ONLINE - Fetching from network:', url.pathname);
//           const networkResponse = await fetchWithTimeout(request, TIMEOUT_MS);
          
//           // Cache successful responses for offline use
//           if (networkResponse.ok) {
//             const responseToCache = networkResponse.clone();
//             caches.open(RUNTIME_CACHE).then((cache) => {
//               console.log('[ServiceWorker] Caching page:', url.pathname);
//               cache.put(request, responseToCache);
              
//               // Also cache as root if it's homepage
//               if (url.pathname === '/' || url.pathname === '') {
//                 cache.put('/', responseToCache.clone());
//               }
//             });
//           }
          
//           return networkResponse;
//         } catch (error) {
//           console.log('[ServiceWorker] Network failed, trying cache for:', url.pathname);
          
//           // Network failed - try cache
//           let cachedResponse = await caches.match(request);
          
//           // If not found, serve the root HTML (app shell)
//           if (!cachedResponse) {
//             console.log('[ServiceWorker] Serving app shell from / for:', url.pathname);
//             cachedResponse = await caches.match('/');
//           }
          
//           if (cachedResponse) {
//             return cachedResponse;
//           }
          
//           // No cache available
//           return new Response('App not available offline', { status: 503 });
//         }
//       })()
//     );
//     return;
//   }

//   // Handle API requests - Fast timeout with cache fallback
//   if (url.pathname.startsWith('/api/')) {
//     event.respondWith(
//       (async () => {
//         // If offline, serve from cache immediately
//         if (!navigator.onLine) {
//           const cachedResponse = await caches.match(request);
//           if (cachedResponse) {
//             console.log('[ServiceWorker] Serving API from cache:', url.pathname);
//             return cachedResponse;
//           }
//           return new Response(
//             JSON.stringify({ error: 'Offline', offline: true }),
//             {
//               status: 503,
//               headers: { 'Content-Type': 'application/json' }
//             }
//           );
//         }
        
//         try {
//           const response = await fetchWithTimeout(request, TIMEOUT_MS);
          
//           // Cache successful GET requests
//           if (request.method === 'GET' && response.ok) {
//             const responseToCache = response.clone();
//             caches.open(RUNTIME_CACHE).then((cache) => {
//               cache.put(request, responseToCache);
//             });
//           }
          
//           return response;
//         } catch (error) {
//           // Try cache
//           const cachedResponse = await caches.match(request);
//           if (cachedResponse) {
//             return cachedResponse;
//           }
          
//           return new Response(
//             JSON.stringify({ error: 'Network error', offline: true }),
//             {
//               status: 503,
//               headers: { 'Content-Type': 'application/json' }
//             }
//           );
//         }
//       })()
//     );
//     return;
//   }

//   // Handle images - Cache First for instant loading
//   if (
//     request.destination === 'image' ||
//     url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i)
//   ) {
//     event.respondWith(
//       (async () => {
//         const cachedResponse = await caches.match(request);
//         if (cachedResponse) {
//           return cachedResponse;
//         }
        
//         try {
//           const response = await fetch(request);
//           if (response.ok) {
//             const responseToCache = response.clone();
//             caches.open(RUNTIME_CACHE).then((cache) => {
//               cache.put(request, responseToCache);
//             });
//           }
//           return response;
//         } catch {
//           return new Response('', { status: 404 });
//         }
//       })()
//     );
//     return;
//   }

//   // Handle CSS and JS - Cache First with background update
//   if (
//     request.destination === 'style' ||
//     request.destination === 'script' ||
//     url.pathname.match(/\.(css|js)$/i)
//   ) {
//     event.respondWith(
//       (async () => {
//         const cachedResponse = await caches.match(request);
        
//         // Serve cache immediately
//         if (cachedResponse) {
//           // Update in background if online
//           if (navigator.onLine) {
//             fetch(request).then((response) => {
//               if (response.ok) {
//                 caches.open(RUNTIME_CACHE).then((cache) => {
//                   cache.put(request, response);
//                 });
//               }
//             }).catch(() => {});
//           }
          
//           return cachedResponse;
//         }
        
//         // No cache, fetch from network
//         const response = await fetch(request);
//         if (response.ok) {
//           const responseToCache = response.clone();
//           caches.open(RUNTIME_CACHE).then((cache) => {
//             cache.put(request, responseToCache);
//           });
//         }
//         return response;
//       })()
//     );
//     return;
//   }

//   // Handle fonts
//   if (
//     request.destination === 'font' ||
//     url.pathname.match(/\.(woff|woff2|ttf|otf|eot)$/i)
//   ) {
//     event.respondWith(
//       (async () => {
//         const cachedResponse = await caches.match(request);
//         if (cachedResponse) {
//           return cachedResponse;
//         }
        
//         try {
//           const response = await fetch(request);
//           if (response.ok) {
//             const responseToCache = response.clone();
//             caches.open(RUNTIME_CACHE).then((cache) => {
//               cache.put(request, responseToCache);
//             });
//           }
//           return response;
//         } catch {
//           return new Response('', { status: 404 });
//         }
//       })()
//     );
//     return;
//   }

//   // Default: network with cache fallback
//   event.respondWith(
//     (async () => {
//       try {
//         const response = await fetch(request);
//         if (response.ok && request.method === 'GET') {
//           const responseToCache = response.clone();
//           caches.open(RUNTIME_CACHE).then((cache) => {
//             cache.put(request, responseToCache);
//           });
//         }
//         return response;
//       } catch {
//         const cachedResponse = await caches.match(request);
//         return cachedResponse || new Response('Offline', { status: 503 });
//       }
//     })()
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



const CACHE_VERSION = 'v1.0.7';
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-cache-${CACHE_VERSION}`;
const TIMEOUT_MS = 2000;

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/market',
  '/investors',
  '/courses',
  '/dashboard',
  '/dashboard/*',
  '/apply',
];

const NEVER_CACHE_ENDPOINTS = [
  '/api/donations/apply',
  '/api/certificates',
  '/api/courses',
  '/api/products',
  '/api/livesessions',
  '/api/profile',
  '/api/users',
  '/api/auth',
];

// Helper: Check if URL should bypass cache
function shouldBypassCache(url) {
  const pathname = url.pathname;
  
  // Never cache POST, PUT, PATCH, DELETE requests
  return NEVER_CACHE_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint));
}

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing v1.0.7...');
  
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
  console.log('[ServiceWorker] Activating v1.0.7...');
  
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

  // Skip Next.js internals
  if (
    url.pathname.startsWith('/__nextjs') ||
    url.pathname.includes('/api/auth/') ||
    url.pathname === '/api/revalidate'
  ) {
    return;
  }

  // CRITICAL: Never cache mutation requests or file uploads
  if (shouldBypassCache(url)) {
    console.log('[ServiceWorker] Bypassing cache for:', url.pathname);
    // Let the request go straight to network, no caching
    return;
  }

  // CRITICAL: Never cache non-GET requests (POST, PUT, DELETE, PATCH)
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    console.log('[ServiceWorker] Bypassing cache for', request.method, 'request:', url.pathname);
    // Let the request go straight to network
    return;
  }

  // Handle _next/static files (JS, CSS, chunks) - CRITICAL FOR OFFLINE
  if (url.pathname.startsWith('/_next/static/')) {
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
        } catch (error) {
          console.error('[ServiceWorker] Failed to fetch static asset:', url.pathname);
          return new Response('', { status: 404 });
        }
      })()
    );
    return;
  }

  // Handle _next/data (RSC data for App Router)
  if (url.pathname.startsWith('/_next/data/') || url.searchParams.has('_rsc')) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);
        
        if (!navigator.onLine && cachedResponse) {
          return cachedResponse;
        }
        
        try {
          const response = await fetchWithTimeout(request, TIMEOUT_MS);
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        } catch (error) {
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response('null', {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        if (!navigator.onLine) {
          console.log('[ServiceWorker] OFFLINE - Serving app shell for:', url.pathname);
          
          let cachedResponse = await caches.match(request);
          
          if (!cachedResponse) {
            cachedResponse = await caches.match('/');
          }
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return new Response('App not available offline', { status: 503 });
        }
        
        try {
          const networkResponse = await fetchWithTimeout(request, TIMEOUT_MS);
          
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
              
              if (url.pathname === '/' || url.pathname === '') {
                cache.put('/', responseToCache.clone());
              }
            });
          }
          
          return networkResponse;
        } catch (error) {
          let cachedResponse = await caches.match(request);
          
          if (!cachedResponse) {
            cachedResponse = await caches.match('/');
          }
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return new Response('App not available offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Handle API requests - ONLY GET requests, never cache mutations
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        // Only cache GET requests
        if (request.method !== 'GET') {
          console.log('[ServiceWorker] Not caching', request.method, 'API request');
          return fetch(request);
        }

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
          
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          
          return response;
        } catch (error) {
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

  // Handle images - Cache First
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

  // Handle CSS and JS - Cache First
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.match(/\.(css|js)$/i)
  ) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
          if (navigator.onLine) {
            fetch(request).then((response) => {
              if (response.ok) {
                caches.open(RUNTIME_CACHE).then((cache) => {
                  cache.put(request, response);
                });
              }
            }).catch(() => {});
          }
          
          return cachedResponse;
        }
        
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

  // Handle fonts
  if (
    request.destination === 'font' ||
    url.pathname.match(/\.(woff|woff2|ttf|otf|eot)$/i)
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

  // Default: network with cache fallback (GET only)
  if (request.method === 'GET') {
    event.respondWith(
      (async () => {
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
          const cachedResponse = await caches.match(request);
          return cachedResponse || new Response('Offline', { status: 503 });
        }
      })()
    );
  }
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