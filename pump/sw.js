// Pentagone Pump : cache de la coquille seulement. dash.json n'est JAMAIS mis en cache.
const C='pump-shell-v2',A=['./','index.html','manifest.json','icon-192.png','icon-512.png','apple-touch-icon.png','inter.woff','jbm.woff'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A.map(u=>new Request(u,{cache:'reload'})))).catch(()=>0))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('pump-')&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 if(u.pathname.endsWith('dash.json')){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>new Response('{"erreur":"hors ligne"}',{status:503,headers:{'Content-Type':'application/json'}})));return}
 e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
