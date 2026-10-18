/* PlatePilot v8 cache: updates code from the network first, works offline afterward. Personal records stay in IndexedDB. */
const CACHE='platepilot-static-v8';
const ASSETS=['./','./index.html','./styles.css','./app.js','./db.js','./seed.js','./nutrition.js','./goals.js','./smart-food.js','./food-search.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./favicon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('platepilot-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{
  if(res.ok&&ASSETS.some(path=>new URL(path,self.registration.scope).pathname===url.pathname)){
   const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{}));
  }
  return res;
 }).catch(async()=>await caches.match(req,{ignoreSearch:true})||await caches.match('./index.html')));
});
