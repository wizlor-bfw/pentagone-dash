const C='pentagone-v23',A=['./','index.html','app.js?v=23','manifest.json','icon-192.png','icon-512.png','styles.css?v=19','jbmono.ttf','three.min.js?v=149','globe.js?v=19','live.js?v=22','live.css?v=19','robot.css?v=20','robot.js?v=21','earth.jpg','moon.jpg','brain/','brain/index.html','brain/brain.js','brain/brain.css','brain/brain_model.bin','brain/brain_model.json'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>0)))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 if(u.pathname.endsWith('data.json')||u.pathname.endsWith('brain.json')){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));return}
 const fresh=e.request.mode==='navigate'||/\.(html|js|css|json)$/.test(u.pathname)||u.pathname.endsWith('/');
 e.respondWith(fetch(e.request,fresh?{cache:'no-cache'}:{}).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:!fresh})))});
