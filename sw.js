// ════════════════════════════════════════════════════════════
//  SERVICE WORKER — JSP Manager PWA + FCM
// ════════════════════════════════════════════════════════════
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const CACHE_NAME = 'jsp-manager-v2';

const firebaseConfig = {
  apiKey: "AIzaSyDSSMGVAQ2ygh2KjPVwePxBnq8_oO6Bzik",
  authDomain: "base-jsp-pacy.firebaseapp.com",
  projectId: "base-jsp-pacy",
  storageBucket: "base-jsp-pacy.firebasestorage.app",
  messagingSenderId: "457252011375",
  appId: "1:457252011375:web:86fe0842684edc24227c9a"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ── Notifications push background ───────────────────────────
messaging.onBackgroundMessage(function(payload) {
  const title = (payload.notification && payload.notification.title) || 'JSP Manager';
  const body  = (payload.notification && payload.notification.body)  || 'Nouvelles données disponibles';
  const icon  = '/icon-192x192.png';
  const badge = '/icon-72x72.png';

  return self.registration.showNotification(title, {
    body:  body,
    icon:  icon,
    badge: badge,
    tag:   'jsp-update',
    renotify: true,
    data:  payload.data || {},
    actions: [
      { action: 'open', title: 'Ouvrir JSP Manager' },
      { action: 'dismiss', title: 'Ignorer' }
    ]
  });
});

// ── Clic sur notification → ouvrir l'appli ──────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if(event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(function(clientList){
      for(var i=0;i<clientList.length;i++){
        if(clientList[i].url.includes('nimaj27.github.io/jsp-manager') && 'focus' in clientList[i]){
          return clientList[i].focus();
        }
      }
      return clients.openWindow('https://nimaj27.github.io/jsp-manager/');
    })
  );
});

// ── Cache hors-ligne ────────────────────────────────────────
self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(['/jsp-manager/', '/jsp-manager/index.html', '/jsp-manager/manifest.json'])
        .catch(function(e){ console.warn('SW precache:', e); });
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.filter(function(n){return n!==CACHE_NAME;}).map(function(n){return caches.delete(n);}));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  if(event.request.url.includes('firebase') || event.request.url.includes('googleapis')) return;
  if(event.request.mode === 'navigate'){
    event.respondWith(
      fetch(event.request).catch(function(){
        return caches.match('/index.html');
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request).then(function(response){
        if(response.ok){
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, clone); });
        }
        return response;
      });
    })
  );
});

self.addEventListener('message', function(event){
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
