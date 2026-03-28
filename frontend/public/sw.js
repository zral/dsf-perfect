const CACHE_VERSION = 'v1';
const CACHE_SHELL = `shell-${CACHE_VERSION}`;
const CACHE_API = `api-${CACHE_VERSION}`;
const CACHE_IMAGES = `images-${CACHE_VERSION}`;
const VALID_CACHES = [CACHE_SHELL, CACHE_API, CACHE_IMAGES];

// Install: precache offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then((cache) =>
      cache.addAll(['/offline.html'])
    )
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !VALID_CACHES.includes(k)).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Helpers
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

function isImageRequest(request) {
  return request.destination === 'image' ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(new URL(request.url).pathname);
}

// Fetch handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  // Skip WebSocket
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;
  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith('http')) return;

  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(cacheFirst(event.request, CACHE_SHELL));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(event.request, CACHE_API));
  } else if (url.pathname.startsWith('/uploads/') || isImageRequest(event.request)) {
    event.respondWith(staleWhileRevalidate(event.request, CACHE_IMAGES));
  } else if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    );
  }
});
