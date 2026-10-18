/** Private PlatePilot Pi backend client. No key is shipped in the public repository. */
export function normalizeBackend({url='', token=''}={}) {
  let base=String(url||'').trim().replace(/\/+$/,'');
  if(base && !/^https:\/\/[a-z0-9.-]+(?::\d+)?(?:\/[a-z0-9/_-]*)?$/i.test(base)){
    throw new Error('Use an HTTPS Raspberry Pi address from Tailscale Serve.');
  }
  return {url:base, token:String(token||'').trim()};
}
export function validateEstimate(payload) {
  const e=payload?.estimate;
  if(!e)return null;
  if(typeof e.name!=='string'||!e.name.trim())throw new Error('Search returned a missing food name.');
  const o={...e};
  for(const k of ['calories','protein','carbs','fat','fiber']) {
    const v=Number(o[k] ?? 0);
    if(!Number.isFinite(v) || v<0 || v>10000)throw new Error('Search returned an invalid nutrition value.');
    o[k]=Math.round(v);
  }
  o.name=o.name.slice(0,130);
  o.restaurant=String(o.restaurant||'').slice(0,120);
  o.cuisine=String(o.cuisine||'').slice(0,100);
  o.serving=String(o.serving||'One meal').slice(0,140);
  o.notes=String(o.notes||'').slice(0,700);
  o.source_url=/^https:\/\//i.test(o.source_url||'')?o.source_url:null;
  o.ingredients=Array.isArray(o.ingredients)?o.ingredients.slice(0,10).map(String):[];
  o.range=Array.isArray(o.range)&&o.range.length===2?o.range.map(Number):[Math.round(o.calories*.7),Math.round(o.calories*1.35)];
  o.verified_nutrition=false;
  return o;
}
export async function resolveWithPi(backend,query,signal) {
  const cfg=normalizeBackend(backend);
  if(!cfg.url || !cfg.token)throw new Error('Connect your Raspberry Pi in Profile → Settings first.');
  const resp=await fetch(cfg.url+'/api/search',{method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.token},
    body:JSON.stringify({query:query.trim().slice(0,180)}),signal});
  if(!resp.ok)throw new Error(resp.status===401?'Incorrect Raspberry Pi access token.':`Pi search unavailable (HTTP ${resp.status}).`);
  const data=await resp.json();
  return {estimate:validateEstimate(data),engine:data.engine||'',menuMatch:!!data.menu_match,sources:data.sources||[],disclaimer:data.disclaimer||''};
}
export async function testPi(backend) {
  const cfg=normalizeBackend(backend);
  if(!cfg.url)throw new Error('Enter your Pi HTTPS address.');
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),9000);
  try {
    const resp=await fetch(cfg.url+'/api/health',{signal:ctrl.signal});
    if(!resp.ok)throw new Error('The Pi health endpoint is unavailable.');
    const data=await resp.json();
    if(data.service!=='PlatePilot Pi search')throw new Error('This URL is not your PlatePilot server.');
    if(!cfg.token)throw new Error('Enter your Pi access token.');
    const auth=await fetch(cfg.url+'/api/check',{headers:{Authorization:'Bearer '+cfg.token},signal:ctrl.signal});
    if(auth.status===401)throw new Error('Incorrect Pi access token.');
    if(!auth.ok)throw new Error('Could not authenticate with your Pi.');
    return data;
  } finally {clearTimeout(timer);}
}
