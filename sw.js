const CACHE_NAME = 'mtg-printer-v3';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon.png'
];

// Installation et forçage de la prise de contrôle
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

// Nettoyage automatique des anciens caches lors d'une mise à jour 
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

// Stratégie "Network First" : le réseau d'abord, le cache en plan B
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Si internet fonctionne, on met à jour le cache silencieusement
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        return response;
      })
      .catch(() => {
        // Si hors-ligne, on ressort la sauvegarde du cache
        return caches.match(e.request);
      })
  );
});
