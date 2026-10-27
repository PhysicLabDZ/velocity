// عامل الخدمة - velocity
// عند كل تحديث للتطبيق: غيّر رقم الإصدار هنا ليصل التحديث إلى من ثبّت التطبيق
const CACHE_VERSION = 'velocity-v1';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        // حذف ذاكرة الإصدارات القديمة لهذا التطبيق فقط (دون المساس بتطبيقات أخرى على النطاق نفسه)
        keys
          .filter((k) => k.startsWith('velocity-') && k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// الشبكة أولاً (ليظهر آخر إصدار)، ثم الذاكرة عند انقطاع الاتصال
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))
      )
  );
});
