/* PlatePilot food discovery v8. Nutrition is per 100 g for compatibility with the existing IndexedDB diary. */
const COCA_SOURCE='https://www.coca-cola.com/us/en/brands/coca-cola/products/original';
// Brand-specific label data is used only where a clearly identified US product and serving are known.
const LABELS=[
 {name:'Coca-Cola Original Taste',brand:'Coca-Cola',portion:'1 can (12 fl oz)',grams:355,kcal:140,p:0,c:39,f:0,aliases:'coke coca cola classic original regular soda soft drink',ref:COCA_SOURCE,verified:true,group:'regular-coke'},
 {name:'Coca-Cola Original Taste',brand:'Coca-Cola',portion:'1 mini can (7.5 fl oz)',grams:222,kcal:90,p:0,c:25,f:0,aliases:'coke coca cola classic original mini',ref:COCA_SOURCE,verified:true,group:'regular-coke'},
 {name:'Coca-Cola Original Taste',brand:'Coca-Cola',portion:'1 bottle (20 fl oz)',grams:591,kcal:240,p:0,c:65,f:0,aliases:'coke coca cola classic original bottle',ref:COCA_SOURCE,verified:true,group:'regular-coke'},
 {name:'Diet Coke',brand:'Coca-Cola',portion:'1 can (12 fl oz)',grams:355,kcal:0,p:0,c:0,f:0,aliases:'diet coke coca cola light soda can',group:'diet-coke'},
 {name:'Coca-Cola Zero Sugar',brand:'Coca-Cola',portion:'1 can (12 fl oz)',grams:355,kcal:0,p:0,c:0,f:0,aliases:'coke zero coke zero sugar cola',group:'zero-coke'},
 // Reference serving estimates below are NOT official manufacturer numbers.
 {name:'Pepsi Cola',brand:'Pepsi',portion:'1 can (12 fl oz)',grams:355,kcal:150,p:0,c:41,f:0,aliases:'pepsi regular cola soda',group:'pepsi'},
 {name:'Diet Pepsi',brand:'Pepsi',portion:'1 can (12 fl oz)',grams:355,kcal:0,p:0,c:0,f:0,aliases:'diet pepsi sugar free soda',group:'diet-pepsi'},
 {name:'Sprite',brand:'Sprite',portion:'1 can (12 fl oz)',grams:355,kcal:140,p:0,c:38,f:0,aliases:'sprite lemon lime soda regular',group:'sprite'},
 {name:'Dr Pepper',brand:'Dr Pepper',portion:'1 can (12 fl oz)',grams:355,kcal:150,p:0,c:40,f:0,aliases:'dr pepper soda pop',group:'dr-pepper'},
 {name:'Gatorade Thirst Quencher',brand:'Gatorade',portion:'1 bottle (20 fl oz)',grams:591,kcal:140,p:0,c:36,f:0,aliases:'gatorade sports drink orange lemon lime',group:'gatorade'},
 {name:'Red Bull Energy Drink',brand:'Red Bull',portion:'1 can (8.4 fl oz)',grams:250,kcal:110,p:0,c:27,f:0,aliases:'red bull energy drink',group:'red-bull'},
 {name:'Orange juice, unsweetened',brand:'Generic serving estimate',portion:'1 cup (8 fl oz)',grams:248,kcal:112,p:2,c:26,f:0,aliases:'orange juice oj fresh',group:'oj'},
 {name:'Milk, 2%',brand:'Generic serving estimate',portion:'1 cup (8 fl oz)',grams:244,kcal:122,p:8,c:12,f:5,aliases:'milk two percent',group:'milk'},
 {name:'Large egg',brand:'Generic serving estimate',portion:'1 large egg',grams:50,kcal:72,p:6.3,c:0.4,f:4.8,aliases:'egg eggs boiled scrambled',group:'egg'},
 {name:'Banana',brand:'Generic serving estimate',portion:'1 medium banana',grams:118,kcal:105,p:1.3,c:27,f:0.4,aliases:'banana fresh fruit',group:'banana'},
 {name:'Apple',brand:'Generic serving estimate',portion:'1 medium apple',grams:182,kcal:95,p:0.5,c:25,f:0.3,aliases:'apple fruit red apple',group:'apple'},
 {name:'White rice, cooked',brand:'Generic serving estimate',portion:'1 cup (158 g)',grams:158,kcal:205,p:4.3,c:45,f:0.4,aliases:'white rice basmati jasmine cooked',group:'rice'},
 {name:'Chicken breast, cooked',brand:'Generic serving estimate',portion:'4 oz (113 g)',grams:113,kcal:187,p:35,c:0,f:4,aliases:'chicken breast grilled baked plain',group:'chicken'},
 {name:'Greek yogurt, plain nonfat',brand:'Generic serving estimate',portion:'1 container (170 g)',grams:170,kcal:100,p:17,c:6,f:0,aliases:'greek yogurt yoghurt plain',group:'yogurt'},
 {name:'Peanut butter',brand:'Generic serving estimate',portion:'2 tbsp (32 g)',grams:32,kcal:188,p:8,c:7,f:16,aliases:'peanut butter pb',group:'peanut-butter'},
 {name:'Bread, whole wheat',brand:'Generic serving estimate',portion:'1 slice (28 g)',grams:28,kcal:69,p:3.6,c:11.5,f:1.1,aliases:'bread wheat toast slice',group:'bread'},
 {name:'Avocado',brand:'Generic serving estimate',portion:'1/2 medium (75 g)',grams:75,kcal:120,p:1.5,c:6.4,f:11,aliases:'avocado half',group:'avocado'}
];
function fix(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/coca[\s-]*cola|coca\s+cola|coke\s+a\s+cola/g,'coke').replace(/\bsandwhich\b/g,'sandwich').replace(/\beggs\b/g,'egg').replace(/\bbananas\b/g,'banana').replace(/\bcans\b/g,'can').replace(/\bbottles\b/g,'bottle').replace(/[^\p{L}\p{N}.]+/gu,' ').trim().replace(/\s+/g,' ');}
const STOP=new Set(['a','an','and','the','of','with','from','at','for','in','my','one','some','large','small','medium','please']);
export function interpretFoodQuery(query){
 const full=fix(query);const parts=full.match(/^(.*?)\s+(?:from|at)\s+(.+)$/);const dish=parts?parts[1].trim():full;
 const restaurant=parts?parts[2].trim():'';
 const isSizeFirst=/^(?:7\.5|8\.4|12|16|20)\s*(?:fl\s*)?(?:oz|ounce|ounces)\b/.test(dish);
 const qtyMatch=!isSizeFirst?dish.match(/^(\d+(?:\.\d+)?)\s+(?:(?:can|bottle|cup|slice|serving|piece)s?\s+(?:of\s+)?)?/):null;
 const quantity=qtyMatch?Math.min(50,Number(qtyMatch[1])):1;
 const tokens=dish.replace(/\b(?:7\.5|8\.4|12|16|20)\s*(?:fl\s*)?(?:oz|ounce|ounces)\b/g,' ').replace(/^\d+(?:\.\d+)?\s*/, ' ').replace(/\b(?:can|bottle|pack|serving)\b/g,' ').split(' ').filter(x=>x&&!STOP.has(x));
 const isDiet=/\b(diet|light)\b/.test(dish);const isZero=/\bzero\b|\bzero sugar\b/.test(dish);
 const size=full.match(/\b(7.5|8.4|12|16|20)\s*(?:fl\s*)?(?:oz|ounce|ounces)\b/);
 return {raw:full,dish,restaurant,tokens,quantity, isDiet,isZero,size:size?.[1]||'',isCan:/\bcan\b/.test(full),isBottle:/\bbottle\b/.test(full)};
}
export const POPULAR_FOODS=LABELS.map((a,i)=>{
 const v=100/a.grams;return {id:'pp-popular-'+i,name:a.name,brand:a.brand,servingG:a.grams,servingLabel:a.portion,
 calories:a.kcal*v,protein:a.p*v,carbs:a.c*v,fat:a.f*v,fiber:0,
 source:a.verified?'Manufacturer label':'Reference serving estimate',verifiedServing:!!a.verified,
 reference:a.ref||'',keywords:a.aliases,productGroup:a.group,caloriesPerServing:a.kcal};
});
function termMatch(hay,t){const terms=hay.split(' ');return terms.some(w=>w===t || t.length>=4&&w.startsWith(t) || (t.length>5&&w.length>5&&levenshteinOne(w,t)));}
function levenshteinOne(a,b){if(Math.abs(a.length-b.length)>1)return false;let i=0,j=0,changes=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++changes>1)return false;if(a.length>b.length)i++;else if(a.length<b.length)j++;else{i++;j++;}}return changes+Math.abs((a.length-i)-(b.length-j))<=1;}
export function foodRelevance(food,query){
 const q=typeof query==='string'?interpretFoodQuery(query):query;if(!q.dish||!q.tokens.length)return -10000;
 const name=fix(food.name), brand=fix(food.brand), serving=fix(food.servingLabel), aliases=fix(food.keywords);
 const hay=[name,brand,aliases].join(' ').trim();let matched=0;for(const t of q.tokens){if(termMatch(hay,t))matched++;}
 if(!matched)return -10000;
 const coverage=matched/q.tokens.length;
 // A match must describe the whole item, not one shared ingredient of a restaurant meal.
 if(q.tokens.length>=2&&coverage<0.65)return -10000;
 let s=matched*100-(q.tokens.length-matched)*90;
 if(name===q.dish)s+=240;
 if(name.startsWith(q.dish))s+=100;
 if(aliases.split(' ').includes(q.dish))s+=60;
 if(food.id?.startsWith('pp-popular-'))s+=70;
 if(food.source==='Your custom food')s+=100;
 if(food.verifiedServing)s+=35;
 if(q.restaurant){if(fix(food.brand).includes(q.restaurant)||name.includes(q.restaurant))s+=190;else if(matched<q.tokens.length)s-=140;}
 // Exclude a different flavor or sugar variant when the query is unambiguous.
 if(/\bcoke\b/.test(q.dish)){
   const diet=/\bdiet\b|\blight\b/.test(name),zero=/\bzero\b/.test(name);
   if(q.isDiet){if(!diet)return -10000;s+=300;}
   else if(q.isZero){if(!zero)return -10000;s+=300;}
   else if(diet||zero)return -10000;
   if(/\b(lime|cherry|vanilla|flavored|flavour|flavor)\b/.test(name)&&!q.tokens.some(t=>name.includes(t)&&t!=='coke'))s-=360;
   if(!q.size&&!q.isBottle&&serving.includes('12 fl oz'))s+=170;
 }
 if(/\bpepsi\b/.test(q.dish)&&!q.isDiet&&/\bdiet\b/.test(name))return -10000;
 if(q.size){s+=serving.includes(q.size+' fl oz')?230:-65;}
 if(q.isCan){s+=serving.includes('can')?35:-20;}
 if(q.isBottle){s+=serving.includes('bottle')?35:-30;}
 // A database result describing a variant which was never searched for should lose to the exact product.
 if(q.tokens.length===1 && /\b(with|flavor|flavour|lime|cherry|vanilla)\b/.test(name))s-=65;
 if(!food.servingLabel)s-=30;
 return s;
}
export function rankFoodMatches(query,foods,limit=30){const q=interpretFoodQuery(query);if(!q.dish)return [];
 const scored=foods.map((food,i)=>({food,i,score:foodRelevance(food,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.i-b.i);
 const seen=new Set();return scored.filter(({food})=>{const k=[fix(food.name),fix(food.brand),fix(food.servingLabel)].join('|');if(seen.has(k))return false;seen.add(k);return true;}).slice(0,limit).map(x=>x.food);
}
