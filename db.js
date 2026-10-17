const NAME = 'platepilot-v1';
const VERSION = 1;
const TABLES = {
  logs: 'date', water: 'date', weights: 'date', workouts: 'date', plans: 'date',
  foods: 'name', recipes: 'name', meta: null
};
let promise;
export function openDB() {
  if (promise) return promise;
  promise = new Promise((resolve, reject) => {
    const req = indexedDB.open(NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const [table, index] of Object.entries(TABLES)) {
        if (!db.objectStoreNames.contains(table)) {
          const store = db.createObjectStore(table, { keyPath: 'id' });
          if (index) store.createIndex(index, index, { unique: false });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return promise;
}
export async function all(table) {
  const db = await openDB();
  return new Promise((resolve,reject) => {
    const req = db.transaction(table, 'readonly').objectStore(table).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
export async function get(table, id) {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const req=db.transaction(table,'readonly').objectStore(table).get(id);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
export async function put(table, value) {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const req=db.transaction(table,'readwrite').objectStore(table).put(value);
    req.onsuccess=()=>resolve(value);
    req.onerror=()=>reject(req.error);
  });
}
export async function remove(table,id) {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const req=db.transaction(table,'readwrite').objectStore(table).delete(id);
    req.onsuccess=()=>resolve();
    req.onerror=()=>reject(req.error);
  });
}
export async function clear(table) {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const req=db.transaction(table,'readwrite').objectStore(table).clear();
    req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);
  });
}
export async function dataDump() {
  const data={format:'platepilot',version:1,exportedAt:new Date().toISOString(),tables:{}};
  for (const table of Object.keys(TABLES)) data.tables[table]=await all(table);
  return data;
}
export async function importDump(data, replace=false) {
  if(data?.format!=='platepilot' || data.version!==1 || !data.tables || typeof data.tables!=='object') throw new Error('Not a supported PlatePilot backup.');
  const incoming={};
  for(const table of Object.keys(TABLES)) {
    const rows=data.tables[table] || [];
    if(!Array.isArray(rows) || rows.length>100000 || rows.some(row=>!row || typeof row.id!=='string')) throw new Error('Invalid backup data in '+table);
    incoming[table]=rows;
  }
  // Validate every table before mutating existing data.
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(Object.keys(TABLES),'readwrite');
    for(const table of Object.keys(TABLES)) {
      const store=tx.objectStore(table);
      if(replace) store.clear();
      for(const item of incoming[table]) store.put(item);
    }
    tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
export const newId = () => (globalThis.crypto?.randomUUID?.() || `pp-${Date.now()}-${Math.random().toString(36).slice(2)}`);
