/* The service worker caches only public application files. Food logs stay in IndexedDB. */
const CACHE='platepilot-static-v5';
const ASSETS=['./','./index.html','./styles.css','./app.js','./db.js','./seed.js','./nutrition.js','./goals.js','./smart-food.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./favicon.svg'];
self.addEventListener('install',evt=>{evt.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',evt=>{evt.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('platepilot-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',evt=>{
 const req=evt.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 // Always check for updated code while online. Offline uses the last cached assets.
 evt.respondWith(fetch(req).then(res=>{
   if(res.ok && !url.search && ASSETS.some(path=>new URL(path,self.registration.scope).pathname===url.pathname)){
     const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
   }
   return res;
 }).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
});
