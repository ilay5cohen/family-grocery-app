// Service Worker for "הסל שלנו" PWA
const CACHE_NAME = 'hasal-shelanu-v1'

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  // Don't intercept analytics, cross-origin APIs or dev server websocket
  const url = new URL(event.request.url)
  if (url.protocol.startsWith('ws') || url.pathname.includes('/@vite')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful local GET responses
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          event.request.url.startsWith(self.location.origin)
        ) {
          const responseClone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return networkResponse
      })
      .catch(() => {
        // If offline, attempt cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse
          // If HTML navigation, return root
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
        })
      })
  )
})
