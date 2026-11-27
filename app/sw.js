/* App de nicho — service worker simples: rede primeiro, cópia offline do app */
const CACHE = 'app-nicho-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
});

/* Avisos no celular (Firebase Cloud Messaging, mensagens só com dados) */
self.addEventListener('push', e => {
  let d = {}; try { const j = e.data ? e.data.json() : {}; d = j.data || (j.notification ? { title: j.notification.title, body: j.notification.body } : j); } catch (x) { d = { title: 'Mamãe Coruja', body: e.data ? e.data.text() : '' }; }
  const title = d.title || 'Mamãe Coruja', u = './?aba=' + encodeURIComponent(d.tab || 'hoje');
  e.waitUntil(self.registration.showNotification(title, { body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || undefined, data: { u } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close(); const u = (e.notification.data && e.notification.data.u) || './';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => { for (const c of cs) { if ('focus' in c) { c.navigate(u).catch(() => {}); return c.focus(); } } return clients.openWindow(u); }));
});
