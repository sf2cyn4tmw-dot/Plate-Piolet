/**
 * Rule-based restaurant meal approximation: no claim of a live restaurant search
 * or restaurant-provided nutrition facts. Numbers are illustrative typical portions.
 * For actual restaurant nutritional values use the separately returned database records.
 */
const I={
  rye:['Rye bread, 2 slices',180,7,34,2.5,3],
  sandwichBread:['Bread, 2 slices',190,7,36,3,3],
  deliMeat:['Pastrami or corned beef, ~140 g',230,30,1,11,0],
  turkey:['Turkey, ~140 g',190,36,1,5,0],
  swiss:['Swiss cheese, ~28 g',110,8,1,9,0],
  sauerkraut:['Sauerkraut, ~60 g',15,1,3,0,2],
  russian:['Russian dressing, ~2 tbsp',160,0,4,16,0],
  butter:['Griddling butter, ~10 g',70,0,0,8,0],
  garlicButter:['Garlic butter, ~10 g',70,0,0,8,0],
  beefPatty:['Beef patty, ~150 g',370,31,0,28,0],
  bun:['Hamburger bun',190,7,34,3,2],
  american:['American cheese slice',65,4,2,5,0],
  mayo:['Mayonnaise, ~1 tbsp',95,0,0,10.5,0],
  lettuce:['Vegetables or lettuce',20,1,4,0,1.4],
  friedChicken:['Fried chicken fillet',420,32,20,25,1],
  grilledChicken:['Grilled chicken, ~150 g',250,46,0,6,0],
  rice:['Cooked rice, ~1.5 cups',310,6,67,1,1],
  beans:['Beans, ~1/2 cup',115,7,20,0,7],
  cheese:['Shredded cheese, ~30 g',120,7,1,10,0],
  salsa:['Salsa, ~60 g',20,1,5,0,1],
  sourCream:['Sour cream, ~2 tbsp',60,1,2,5,0],
  guac:['Guacamole, ~2 oz',100,1,5,9,4],
  tortilla:['Large flour tortilla',320,9,53,9,3],
  tacoTortilla:['Taco tortillas, two small',120,3,24,2,3],
  pizza:['Large cheese pizza slice',320,13,37,13,2],
  pepperoni:['Pepperoni topping',80,3,0,7,0],
  fries:['Medium fries',370,5,48,18,4],
  dressing:['Salad dressing, ~2 tbsp',160,0,3,17,0],
  greens:['Salad greens and vegetables',85,4,14,1,4],
  croutons:['Croutons, ~25 g',110,3,18,3,1],
  parmesan:['Parmesan, ~20 g',85,7,1,6,0],
  sauce:['Sauce, ~2 tbsp',120,1,7,10,0],
  hummus:['Hummus, ~1/3 cup',140,5,12,9,4],
  avocado:['Avocado, ~1/2 fruit',160,2,9,15,7],
  egg:['Egg, large',75,6,0,5,0],
  bacon:['Bacon, 2 strips',85,6,0,7,0],
  bagel:['Bagel, large',320,11,64,2,3],
  creamCheese:['Cream cheese, ~2 tbsp',100,2,2,10,0],
  pancakes:['Pancakes, stack of 3',430,11,72,11,2],
  syrup:['Syrup, ~3 tbsp',160,0,40,0,0],
  pasta:['Cooked pasta, ~2 cups',400,14,80,3,4],
  alfredo:['Cream-based sauce, ~1/2 cup',310,7,9,27,0],
  marinara:['Tomato sauce, ~1/2 cup',85,2,15,2,3],
  meatballs:['Meatballs, ~3 medium',250,18,9,15,1],
  ramen:['Ramen noodles and broth',460,16,70,13,3],
  pork:['Pork or meat topping',150,18,2,8,0],
  sushi:['Typical sushi roll, 8 pcs',360,13,58,8,2],
  pho:['Pho rice noodles and broth',390,21,65,4,2],
  gyro:['Gyro meat, ~4 oz',290,19,5,21,0],
  pita:['Pita bread',190,6,35,2,2],
  tzatziki:['Tzatziki, ~3 tbsp',55,3,3,3,0],
  quesadilla:['Tortilla with cheese, large',490,20,49,24,3],
  falafel:['Falafel, ~4 pieces',320,12,32,16,8],
  butterCurry:['Butter chicken curry with chicken, tomato, cream and butter',900,57,28,60,4],
  tikkaCurry:['Chicken tikka masala in creamy tomato sauce',790,55,28,51,4],
  curryRice:['Basmati rice, around 1.5 cups',310,6,67,1,1],
  biryani:['Biryani with chicken, rice and ghee',970,41,126,33,5],
  milk:['Milk or cream in beverage',95,5,10,4,0]
};
const T=[
  {id:'butter-chicken',re:/\b(?:butter\s+chicken|murgh\s+makhani)\b/i,name:'Butter chicken with rice',parts:['butterCurry','curryRice'],margin:.35},
  {id:'tikka-masala',re:/\btikka\s+masala\b/i,name:'Chicken tikka masala with rice',parts:['tikkaCurry','curryRice'],margin:.35},
  {id:'biryani',re:/\bbiryani\b/i,name:'Biryani',parts:['biryani'],margin:.35},
  {id:'breakfast-reuben',re:/\bbreakfast\s+reu[bh]en\b/i,name:'Breakfast Reuben',parts:['rye','deliMeat','swiss','sauerkraut','russian','butter','egg'],margin:.3},
  {id:'reuben',re:/\breu[bh]en\b/i,name:'Reuben sandwich',parts:['rye','deliMeat','swiss','sauerkraut','russian','butter'],margin:.3},
  {id:'chicken-caesar',re:/\b(?:chicken\s+caesar|caesar\s+(?:salad\s+)?with\s+chicken)\b/i,name:'Chicken Caesar salad',parts:['greens','grilledChicken','parmesan','croutons','dressing'],margin:.3},
  {id:'caesar',re:/\bcaesar\b/i,name:'Caesar salad',parts:['greens','parmesan','croutons','dressing'],margin:.3},
  {id:'cheeseburger',re:/\bcheese\s*burger\b/i,name:'Cheeseburger',parts:['bun','beefPatty','american','sauce','lettuce'],margin:.3},
  {id:'burger',re:/\b(?:hamburger|burger)\b/i,name:'Hamburger',parts:['bun','beefPatty','sauce','lettuce'],margin:.3},
  {id:'fried-chicken-sandwich',re:/\b(?:crispy|fried)\s+chicken\s+(?:sandwich|burger)\b/i,name:'Fried chicken sandwich',parts:['bun','friedChicken','mayo','lettuce'],margin:.3},
  {id:'chicken-sandwich',re:/\bchicken\s+(?:sandwich|burger)\b/i,name:'Chicken sandwich',parts:['bun','grilledChicken','mayo','lettuce'],margin:.3},
  {id:'burrito-bowl',re:/\b(?:burrito\s+bowl|rice\s+bowl|grain\s+bowl)\b/i,name:'Rice or burrito bowl',parts:['rice','grilledChicken','beans','cheese','salsa','sourCream'],margin:.35},
  {id:'burrito',re:/\bburrito\b/i,name:'Burrito',parts:['tortilla','rice','beans','grilledChicken','cheese','salsa','sourCream'],margin:.32},
  {id:'tacos',re:/\btacos?\b/i,name:'Two tacos',parts:['tacoTortilla','grilledChicken','salsa','cheese','sourCream'],margin:.35},
  {id:'pizza',re:/\b(?:pizza|slice of pizza)\b/i,name:'Pizza slice',parts:['pizza'],margin:.35},
  {id:'fries',re:/\b(?:french\s+fries|fries)\b/i,name:'Fries',parts:['fries'],margin:.3},
  {id:'salad',re:/\bsalad\b/i,name:'Restaurant salad',parts:['greens','dressing','croutons'],margin:.45},
  {id:'bagel-cream-cheese',re:/\bbagel\b(?=.*\b(?:cream\s+cheese|schmear)\b)/i,name:'Bagel with cream cheese',parts:['bagel','creamCheese'],margin:.25},
  {id:'bagel',re:/\bbagel\b/i,name:'Bagel',parts:['bagel'],margin:.25},
  {id:'pancakes',re:/\bpancakes?\b/i,name:'Pancakes with syrup',parts:['pancakes','syrup','butter'],margin:.28},
  {id:'pasta-alfredo',re:/\balfredo\b/i,name:'Pasta Alfredo',parts:['pasta','alfredo','parmesan'],margin:.3},
  {id:'pasta',re:/\b(?:pasta|spaghetti)\b/i,name:'Pasta with tomato sauce',parts:['pasta','marinara','parmesan'],margin:.35},
  {id:'ramen',re:/\bramen\b/i,name:'Ramen',parts:['ramen','egg','pork'],margin:.35},
  {id:'pho',re:/\bpho\b/i,name:'Pho',parts:['pho'],margin:.3},
  {id:'sushi',re:/\b(?:sushi|maki\s+roll|california\s+roll)\b/i,name:'Sushi roll',parts:['sushi'],margin:.35},
  {id:'gyro',re:/\bgyro\b/i,name:'Gyro',parts:['pita','gyro','tzatziki','lettuce'],margin:.3},
  {id:'quesadilla',re:/\bquesadilla\b/i,name:'Quesadilla',parts:['quesadilla','sourCream','salsa'],margin:.3},
  {id:'falafel',re:/\bfalafel\b/i,name:'Falafel pita',parts:['falafel','pita','tzatziki','lettuce'],margin:.35},
  {id:'breakfast-sandwich',re:/\b(?:bacon.?egg.?cheese|egg\s+(?:and|&)\s+cheese|breakfast\s+sandwich)\b/i,name:'Egg and cheese sandwich',parts:['sandwichBread','egg','american','bacon','butter'],margin:.35},
  {id:'turkey-sandwich',re:/\bturkey\s+(?:sandwich|sub)\b/i,name:'Turkey sandwich',parts:['sandwichBread','turkey','swiss','mayo','lettuce'],margin:.3},
  {id:'blt',re:/\bblt\b/i,name:'BLT sandwich',parts:['sandwichBread','bacon','bacon','mayo','lettuce'],margin:.32},
];
const round=x=>Math.round(x);
const norm=s=>String(s||'').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
const suppress=(text, words)=>words.some(w=>new RegExp(`\\b(?:no|without|hold|skip)\\s+(?:the\\s+)?${w}\\b`,'i').test(text));
const buff=/\bbuffalo\s*(?:&|and|n|\+)?\s*bergens?\b|\bbuffalo\s+bergen\b/i;
export function estimateRestaurantMeal(phrase){
 const original=String(phrase||'').trim().slice(0,200);
 if(original.length<3)return null;
 const input=norm(original);
 const match=T.find(t=>t.re.test(input));
 if(!match)return null;
 const venue=buff.test(input) && (match.id==='reuben'||match.id==='breakfast-reuben');
 let parts=[...match.parts];
 if(match.id==='reuben'||match.id==='breakfast-reuben'){
  if(/\bwith\s+turkey\b|\bturkey\s+reuben\b/.test(input)) parts=parts.map(x=>x==='deliMeat'?'turkey':x);
  if(venue && match.id==='reuben')parts=parts.map(x=>x==='butter'?'garlicButter':x);
 }
 if(suppress(input,['rice']))parts=parts.filter(x=>x!=='curryRice');
 if(suppress(input,['dressing','sauce','russian']))parts=parts.filter(x=>!['russian','sauce','mayo','dressing','alfredo','tzatziki'].includes(x));
 if(suppress(input,['cheese','swiss']))parts=parts.filter(x=>!['swiss','american','cheese','parmesan','creamCheese'].includes(x));
 if(suppress(input,['butter']))parts=parts.filter(x=>!['butter','garlicButter'].includes(x));
 if(suppress(input,['bread','bun']))parts=parts.filter(x=>!['rye','sandwichBread','bun','pita','bagel'].includes(x));
 if(suppress(input,['meat','chicken','pastrami','turkey']))parts=parts.filter(x=>!['deliMeat','turkey','beefPatty','grilledChicken','friedChicken'].includes(x));
 if(/\b(?:extra|double)\s+(?:meat|pastrami|corned beef|chicken|beef|cheeseburger|burger)\b/.test(input)){
  const meat=parts.find(x=>['deliMeat','turkey','grilledChicken','beefPatty','friedChicken','gyro','pork'].includes(x));if(meat)parts.push(meat);
 }
 if(/\bextra\s+cheese\b/.test(input)){const cheese=parts.find(x=>['swiss','cheese','american','parmesan'].includes(x));if(cheese)parts.push(cheese);}
 if(/\b(?:with|add|extra)\s+avocado\b/.test(input))parts.push('avocado');
 if(/\b(?:with|add|extra)\s+(?:guac|guacamole)\b/.test(input))parts.push('guac');
 if(/\bpepperoni\b/.test(input)&&match.id==='pizza')parts.push('pepperoni');
 if(/\bchicken\b/.test(input)&&['pasta','pasta-alfredo','salad'].includes(match.id))parts.push('grilledChicken');
 if(/\bmeatballs?\b/.test(input)&&match.id==='pasta')parts.push('meatballs');
 let servings=1;
 if(/\bhalf\s+(?:a\s+)?(?:sandwich|portion|order|serving|reuben|breakfast|burger|burrito|bagel|salad)\b|\b1\s*\/\s*2\b/.test(input))servings=.5;
 if(/\b(?:two|2)\s+(?:pizza\s+)?slices\b/.test(input)&&match.id==='pizza')servings=2;
 if(/\b(?:three|3)\s+(?:pizza\s+)?slices\b/.test(input)&&match.id==='pizza')servings=3;
 const sum={calories:0,protein:0,carbs:0,fat:0,fiber:0};
 const ingredients=parts.map(k=>I[k]).filter(Boolean).map(row=>{
  ['calories','protein','carbs','fat','fiber'].forEach((key,i)=>sum[key]+=row[i+1]*servings);
  return {name:row[0],calories:round(row[1]*servings)};
 });
 for(const key of Object.keys(sum))sum[key]=round(sum[key]);
 const label=venue?(match.id==='reuben'?'The Well-Dressed Reuben · Buffalo & Bergen':'Breakfast Reuben · Buffalo & Bergen'):(original.length<=75?original:match.name);
 const assumption=(match.id==='reuben'||match.id==='breakfast-reuben')&&!/\b(?:turkey|corned\s+beef|pastrami)\b/.test(input)?' Assumed pastrami or corned beef.':'';
 const venueNote=venue?' Menu ingredients checked against Buffalo & Bergen’s online menu; the restaurant does not provide these nutrition totals.':'';
 const low=round(sum.calories*(1-match.margin)),high=round(sum.calories*(1+match.margin));
 const notes=`Approximation from typical ingredient portions; not official nutrition. Approximate range ${low}–${high} kcal.${assumption}${venueNote} Tap Review to edit before saving.`;
 return {name:label,query:original,template:match.id,source:'Ingredient-based estimate',calories:sum.calories,protein:sum.protein,carbs:sum.carbs,fat:sum.fat,fiber:sum.fiber,range:[low,high],ingredients,notes,menuUrl:venue?'https://order.toasttab.com/online/buffalo-bergen-union-market/item-the-welldressed-reuben_6e6aa92d-cea0-4252-9142-82dcecbabfb7':null};
}
export function genericSearchText(phrase){
 const meal=estimateRestaurantMeal(phrase);
 if(meal){const names={reuben:'reuben sandwich', 'breakfast-reuben':'reuben sandwich','burrito-bowl':'burrito bowl', pizza:'pizza cheese','pasta-alfredo':'pasta alfredo', 'chicken-caesar':'chicken caesar salad'};
  return names[meal.template]||meal.template.replace(/-/g,' ');}
 return String(phrase||'').trim().replace(/\b(?:from|at)\s+.{3,}$/i,'').trim();
}
