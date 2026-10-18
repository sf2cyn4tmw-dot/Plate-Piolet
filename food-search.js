// Exact manufacturer values are only used for the products and sizes listed here.
// All entries use an approximate mass equivalent for volume-based portion controls.
const OFFICIAL='https://www.coca-cola.com/us/en/about-us/faq/how-much-sugar-is-in-coca-cola';
const PICKS=[
 ['Coca-Cola Original Taste','1 can (12 fl oz)',355,140,39,'coke regular coca cola classic original soda can',0],
 ['Coca-Cola Original Taste','1 mini can (7.5 fl oz)',222,90,25,'coke regular coca cola original mini',0],
 ['Coca-Cola Original Taste','1 bottle (20 fl oz)',591,240,65,'coke regular coca cola original bottle',0],
 ['Coca-Cola Original Taste','1 bottle (16 fl oz)',473,190,52,'coke regular coca cola original bottle',0],
 ['Diet Coke','1 can (12 fl oz)',355,0,0,'diet coke coca cola light sugar free can',1],
 ['Coca-Cola Zero Sugar','1 can (12 fl oz)',355,0,0,'coke zero coca cola zero sugar sugarfree can',2]
];
export const POPULAR_FOODS=PICKS.map(([name,servingLabel,servingG,kcal,carbs,aliases,variant],i)=>({
 id:`official-cola-${i}`,name,brand:'Coca-Cola',servingLabel,servingG,
 // Store nutrition per 100 g for compatibility with PlatePilot's existing scaling model.
 calories:kcal/servingG*100,protein:0,carbs:carbs/servingG*100,fat:0,fiber:0,
 source:'Manufacturer nutrition facts',reference:OFFICIAL,verifiedServing:true,
 keywords:aliases,variant,caloriesPerServing:kcal
}));
function norm(s){return String(s||'').toLowerCase().replace(/coca[\s-]*cola/g,'coke').replace(/coke[\s-]*a[\s-]*cola/g,'coke').replace(/\bdietary\b/g,'diet').replace(/[^a-z0-9.]+/g,' ').trim().replace(/\s+/g,' ');}
function request(q){const x=norm(q);const toks=x.split(' ').filter(Boolean);const coke=/\bcoke\b/.test(x);const diet=/\bdiet\b|\blight\b/.test(x);const zero=/\bzero\b|\bno sugar\b|\bsugar free\b/.test(x);const size=x.match(/\b(7.5|12|16|20)\s*(?:fl\s*)?(?:oz|ounce|ounces)\b/);
 return {x,toks,coke,diet,zero,size:size?.[1]||null,can:/\bcan\b/.test(x),bottle:/\bbottle\b/.test(x)};}
export function foodRelevance(food,q){const r=request(q);if(!r.x)return -1;
 const name=norm(food.name),brand=norm(food.brand),serving=norm(food.servingLabel),hay=`${name} ${brand} ${norm(food.keywords)} ${serving}`;
 const unique=[...new Set(r.toks.filter(x=>!['a','an','of','the','from','at','one','and'].includes(x)))];
 let matches=0;for(const tok of unique)if(hay.split(' ').some(word=>word===tok||tok.length>=4&&word.startsWith(tok)))matches++;
 if(!matches)return -1;
 let score=matches*30 - (unique.length-matches)*13;
 if(name===r.x||brand===r.x)score+=100;
 if(name.startsWith(r.x))score+=45;
 if(hay.includes(r.x))score+=25;
 if(food.verifiedServing)score+=40;
 if(food.source==='Your custom food')score+=20;
 if(r.coke){
   const isDiet=/\bdiet\b|\blight\b/.test(name);
   const isZero=/\bzero\b/.test(name);
   const isOriginal=/\bcoke\b/.test(name)&&!isDiet&&!isZero;
   if(r.diet){score+=isDiet?180:-160;}
   else if(r.zero){score+=isZero?180:-160;}
   else {score+=isOriginal?160:-160;}
   if(/\blime\b|\bcherry\b|\bvanilla\b|\bflavor/.test(name) && !/\blime\b|\bcherry\b|\bvanilla\b|\bflavor/.test(r.x))score-=100;
   if(isOriginal && !r.size && !r.bottle && /12 fl oz/.test(serving))score+=90;
 }
 if(r.size){score+=serving.includes(`${r.size} fl oz`)?220:-55;}
 if(r.can){score+=/\bcan\b/.test(serving)?45:-35;}
 if(r.bottle){score+=/\bbottle\b/.test(serving)?45:-35;}
 return score;
}
export function rankFoodMatches(q,foods,limit=30){if(!norm(q))return [];
 const eligible=foods.map((food,i)=>({food,score:foodRelevance(food,q),i})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.i-b.i);
 const found=new Set();return eligible.filter(x=>{const key=[norm(x.food.name),norm(x.food.brand),norm(x.food.servingLabel),x.food.barcode||''].join('|');if(found.has(key))return false;found.add(key);return true;}).slice(0,limit).map(x=>x.food);
}
