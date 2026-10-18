export function round(v, n=1){ const x=Number(v);return Number.isFinite(x)?Math.round(x*10**n)/10**n:0; }
export function n(v){return Number.isFinite(Number(v))?Math.max(0,Number(v)):0;}
export function totals(rows){return rows.reduce((a,r)=>{for(const k of ['calories','protein','carbs','fat','fiber'])a[k]+=n(r[k]);return a;},{calories:0,protein:0,carbs:0,fat:0,fiber:0});}
export function scale(food,grams){const portion=n(grams)/100;return Object.fromEntries(['calories','protein','carbs','fat','fiber'].map(k=>[k,round(n(food[k])*portion)]));}
export function parseAI(s) {
 const str=String(s||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
 let obj;try{obj=JSON.parse(str);}catch{const a=str.indexOf('{'),b=str.lastIndexOf('}');if(a<0||b<=a)throw Error('Paste the JSON response from your Shortcut.');obj=JSON.parse(str.slice(a,b+1));}
 if(!obj || typeof obj!=='object')throw Error('Invalid AI response.');
 if(obj.type==='workout') return {type:'workout',name:String(obj.name||'Workout').slice(0,90),date:String(obj.date||''),minutes:n(obj.minutes),calories:n(obj.calories)};
 const food=obj.food && typeof obj.food==='object'?obj.food:obj;
 if(!food.name || !Number.isFinite(Number(food.calories)))throw Error('Missing food name or calories. See the Shortcut guide for the required JSON.');
 if(n(food.calories)>10000)throw Error('Calorie value is unusually large. Please check the estimate.');
 return {type:'food',name:String(food.name).slice(0,120),calories:n(food.calories),protein:n(food.protein),carbs:n(food.carbs),fat:n(food.fat),fiber:n(food.fiber),notes:String(food.notes||obj.notes||'').slice(0,400)};
}
export function offToFood(p) {
 const v=p?.nutriments||{};
 const kj = Number(v['energy-kcal_100g']);
 const calories=Number.isFinite(kj)?kj:(Number.isFinite(Number(v.energy_100g))?Number(v.energy_100g)/4.184:NaN);
 if(!Number.isFinite(calories)||calories<0)return null;
 const name=String(p.product_name||p.product_name_en||'').trim();
 if(!name)return null;
 return {id:'off-'+String(p.code||name),name:name.slice(0,130),brand:String(p.brands||'').slice(0,100),calories:round(calories),protein:round(n(v.proteins_100g)),carbs:round(n(v.carbohydrates_100g)),fat:round(n(v.fat_100g)),fiber:round(n(v.fiber_100g)),servingG:100,source:'Open Food Facts',barcode:String(p.code||'')};
}
const API='https://world.openfoodfacts.org';
export async function findProducts(q) {
 const url=`${API}/cgi/search.pl?search_simple=1&action=process&json=1&page_size=15&search_terms=${encodeURIComponent(q)}&fields=code,product_name,product_name_en,brands,nutriments`;
 const r=await fetch(url,{headers:{'Accept':'application/json'}});
 if(!r.ok)throw Error(`Food search failed (${r.status})`);
 const j=await r.json();return (j.products||[]).map(offToFood).filter(Boolean);
}
export async function findBarcode(barcode) {
 const code=String(barcode).replace(/\D/g,''); if(code.length<8 || code.length>14) throw Error('Enter a valid barcode (8–14 digits).');
 const r=await fetch(`${API}/api/v2/product/${encodeURIComponent(code)}.json?fields=code,product_name,product_name_en,brands,nutriments`,{headers:{'Accept':'application/json'}});
 if(!r.ok)throw Error(`Barcode lookup failed (${r.status})`);
 const j=await r.json(); const f=j.status===1?offToFood(j.product):null;
 if(!f)throw Error('Barcode not found or nutrition data unavailable. Enter the label manually.');return f;
}
// USDA FoodData Central offers broad food and branded-menu lookup. DEMO_KEY is
// deliberately restricted: for heavier use, use a private server-side API key.
export function usdaToFood(food) {
 if (!food?.fdcId || !food?.description) return null;
 const items=food.foodNutrients||[];
 function nutrient(ids, names=[]) {
   const matched=items.find(x => ids.includes(Number(x.nutrientId ?? x.number)) &&
     (x.unitName||'').toLowerCase()!=='kj') || items.find(x=>names.some(q=>(x.nutrientName||x.name||'').toLowerCase()===q));
   return matched ? Number(matched.value ?? matched.amount) : NaN;
 }
 const cal=nutrient([1008,2047,2048],['energy']);
 const protein=nutrient([1003],['protein']);
 const carbs=nutrient([1005],['carbohydrate, by difference']);
 const fat=nutrient([1004],['total lipid (fat)']);
 const fiber=nutrient([1079],['fiber, total dietary']);
 if (!Number.isFinite(cal) || cal<0 || cal>1200) return null;
 // Search endpoint reports composition per 100g for branded and generic foods.
 const servingG=String(food.servingSizeUnit||'').toLowerCase()==='g'
   && Number(food.servingSize)>0 ? Number(food.servingSize) : 100;
 return {id:'usda-'+food.fdcId,name:String(food.description).slice(0,130),
   brand:String(food.brandName||food.brandOwner||food.dataType||'').slice(0,110),
   calories:round(cal),protein:round(Number.isFinite(protein)?protein:0),
   carbs:round(Number.isFinite(carbs)?carbs:0),fat:round(Number.isFinite(fat)?fat:0),
   fiber:round(Number.isFinite(fiber)?fiber:0),servingG,source:'USDA FoodData Central',
   reference:'https://fdc.nal.usda.gov/food-details/'+food.fdcId+'/nutrients'};
}
export async function findUSDA(query) {
 const q=String(query||'').trim();
 if(q.length<2)throw Error('Enter a longer search.');
 // This public demonstration key is limited to 30 requests/hour, 50/day per IP.
 const url='https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&'
  +new URLSearchParams({query:q,pageSize:'25'}).toString();
 const res=await fetch(url,{headers:{Accept:'application/json'}});
 if(!res.ok)throw Error('USDA lookup failed ('+res.status+'). Demo requests may be limited.');
 const data=await res.json();
 return (data.foods||[]).map(usdaToFood).filter(Boolean);
}

// Extract per-serving published values from plain nutrition text copied from a menu
// or PDF. This is extraction, not inference; missing macros should be reviewed.
export function parsePublishedFacts(text, foodName='Restaurant meal') {
 const raw=String(text||'').replace(/(\d),(?=\d{3}\b)/g,'$1').replace(/[,\u00a0]/g,' ').replace(/\s+/g,' ').trim();
 if(!raw)throw Error('Paste the published nutrition text first.');
 function val(expressions) {
   for(const re of expressions){const m=raw.match(re);if(m){const x=Number(m[1]);if(Number.isFinite(x))return x;}}
   return null;
 }
 const kcal=val([/\b(?:calories|energy\s*\(kcal\)|kcal)\s*[:\-]?\s*(\d{1,5}(?:\.\d+)?)/i, /\b(\d{1,5}(?:\.\d+)?)\s*(?:kcal|calories)\b/i]);
 if(kcal===null || kcal>10000)throw Error('Calories were not found. Paste a nutrition table that includes Calories, Protein, Carbs and Fat.');
 const protein=val([/\bprotein(?:\s*\(g\))?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?\b/i, /\b(\d+(?:\.\d+)?)\s*g\s+protein\b/i]);
 const carbs=val([/\b(?:total\s+)?carbohydrates?(?:\s*\(g\))?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?\b/i, /\bcarbs?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?\b/i, /\b(\d+(?:\.\d+)?)\s*g\s+(?:carbs?|carbohydrates?)\b/i]);
 const fat=val([/\btotal\s+fat(?:\s*\(g\))?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?\b/i, /\bfat(?:\s*\(g\))?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?\b/i, /\b(\d+(?:\.\d+)?)\s*g\s+fat\b/i]);
 const fiber=val([/\b(?:dietary\s+)?fib(?:er|re)(?:\s*\(g\))?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?\b/i]);
 const absent=[['protein',protein],['carbs',carbs],['fat',fat]].filter(([k,v])=>v===null).map(([k])=>k);
 return {name:String(foodName||'Restaurant meal').trim().slice(0,130)||'Restaurant meal',
  calories:kcal,protein:protein??0,carbs:carbs??0,fat:fat??0,fiber:fiber??0,
  notes:'From pasted published nutrition facts, per listed serving. '+(absent.length?'Not found (entered as zero, correct before saving): '+absent.join(', ')+'. ':'')+'Verify portion size and source.'};
}

export const dateKey=(date=new Date())=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
export function shiftDate(date,days) {const [y,m,d]=date.split('-').map(Number); const x=new Date(y,m-1,d+days);return dateKey(x);}
export function prettyDate(key,opts={weekday:'long',month:'short',day:'numeric'}) {const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-US',opts);}
