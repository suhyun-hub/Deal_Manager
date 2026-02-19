const CACHE_NAME = 'deal-manager-v1';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/ui.js',
    './js/storage.js',
    './js/data.js',
    './js/analytics.js',
    './js/notifications.js',
    './js/kanban.js',
    './js/tags.js',
    './js/compare.js',
    './js/timeline.js',
    './js/attachments.js',
    './js/advfilter.js',
    './js/report.js',
    './js/csv.js',
    './js/swipe.js'
];

// Install: cache app shell
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: cache-first for app shell, network-first for data
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
