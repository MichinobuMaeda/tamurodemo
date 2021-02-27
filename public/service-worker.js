const cacheName = '20210228050955'
const precacheResources = [
  '/',
  'index.html',
  'img/icons/android-chrome-192x192.png',
  'img/icons/android-chrome-512x512.png',
  'img/icons/android-chrome-maskable-192x192.png',
  'img/icons/android-chrome-maskable-512x512.png',
  'img/icons/apple-touch-icon-120x120.png',
  'img/icons/apple-touch-icon-152x152.png',
  'img/icons/apple-touch-icon-180x180.png',
  'img/icons/apple-touch-icon-60x60.png',
  'img/icons/apple-touch-icon-76x76.png',
  'img/icons/apple-touch-icon.png',
  'img/icons/favicon-16x16.png',
  'img/icons/favicon-32x32.png',
  'img/icons/msapplication-icon-144x144.png',
  'img/icons/mstile-150x150.png',
  'img/icons/safari-pinned-tab.svg'
]

self.addEventListener('install', event => {
  console.log('Service worker has been installed.')
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(precacheResources)
      })
  )
})

self.addEventListener('activate', async event => {
  console.log('Service worker has been activated.')
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName) {
          return caches.delete(key)
        }
      }))
    })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request)
    .then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
    })
  )
})

self.addEventListener('message', event => {
  console.log('message', JSON.stringify(event))
})
