const embedded=()=>window.self!==window.top;
const slugFromPath=()=>{const m=location.pathname.match(/^\/x\/([^/]+)/);return m?decodeURIComponent(m[1]):null};

export function emitPlatformEvent(type,meta={}){
  const payload={source:'ARQRAN',type,sceneId:slugFromPath(),url:location.href,ts:new Date().toISOString(),meta};
  if(embedded()){
    try{window.parent.postMessage({channel:'arqran',...payload},'*')}catch{}
  }
  window.dispatchEvent(new CustomEvent('arqran:event',{detail:payload}));
  if(payload.sceneId){
    fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sceneId:payload.sceneId,type,meta})}).catch(()=>{});
  }
  return payload;
}

export function installPlatformBridge(){
  document.documentElement.dataset.embedded=embedded()?'true':'false';
  const sceneId=slugFromPath();
  if(sceneId) emitPlatformEvent('scene_open',{referrer:document.referrer||null,embedded:embedded()});

  document.addEventListener('click',event=>{
    const el=event.target?.closest?.('a,button');
    if(!el)return;
    const href=el.tagName==='A'?el.href:null;
    const download=el.tagName==='A'&&el.hasAttribute('download');
    const label=(el.innerText||el.getAttribute('aria-label')||el.title||'').trim().slice(0,160);
    if(download) emitPlatformEvent('download',{href,label});
    else if(href) emitPlatformEvent('click',{href,label});
    else if(/place in real-world ar/i.test(label)) emitPlatformEvent('ar_button',{label});
  },{capture:true});

  window.addEventListener('message',event=>{
    const msg=event.data;
    if(!msg||msg.channel!=='arqran:host')return;
    if(msg.type==='ping') event.source?.postMessage?.({channel:'arqran',type:'ready',sceneId,url:location.href},event.origin||'*');
    if(msg.type==='navigate'&&typeof msg.url==='string'&&msg.url.startsWith('/')) location.assign(msg.url);
  });

  return {embedded:embedded(),sceneId};
}
