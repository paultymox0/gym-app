const CACHE_NAME = 'gymapp-v2';

// Install: cache immutable assets only — NOT index.html
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(['/manifest.json']))
    // No skipWaiting() — new SW waits for user confirmation via banner
  );
});

// Activate: purge old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// Messages from client
self.addEventListener('message', event => {
  const { type, endTime, exerciseName } = event.data ?? {};

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  // Schedule a rest-done notification when the app may be in background.
  // event.waitUntil keeps the SW alive until the Promise resolves.
  if (type === 'REST_TIMER_START') {
    const delay = Math.max(0, endTime - Date.now());
    event.waitUntil(new Promise(resolve => {
      setTimeout(() => {
        self.registration.showNotification('¡Listo! 💪', {
          body: exerciseName ? `${exerciseName} — Siguiente serie` : 'Siguiente serie',
          tag: 'rest-done',
          icon: '/icons/icon-192.svg',
          badge: '/icons/icon-192.svg',
          vibrate: [200, 100, 200],
          requireInteraction: false,
          data: { url: '/habits' },
        }).catch(() => {}).finally(resolve);
      }, delay);
    }));
  }

  if (type === 'REST_TIMER_STOP') {
    // Nothing to cancel (setTimeout already fired or will be ignored)
    // Close any lingering "resting" notification
    self.registration.getNotifications({ tag: 'rest-timer' }).then(notifs => notifs.forEach(n => n.close()));
  }
});

// Tap on notification → open/focus app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API — network only, never cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Sin conexión', offline: true }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        })
      )
    );
    return;
  }

  // Navigation (index.html) — network-first so deploys are always visible;
  // cache the response so the app works offline after first load.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/')))
    );
    return;
  }

  // Hashed assets (/assets/*.js, /assets/*.css) — cache-first, they're immutable
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(c => c.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else (icons, fonts) — stale-while-revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const fresh = fetch(request).then(response => {
        if (response.ok) {
          caches.open(CACHE_NAME).then(c => c.put(request, response.clone()));
        }
        return response;
      });
      return cached ?? fresh;
    })
  );
});

// Background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SYNC_OFFLINE_QUEUE' }))
      )
    );
  }
});
