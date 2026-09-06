const TYPES={model:'model',image:'image',photo:'image',picture:'image',video:'video',web:'web',website:'web',browser:'web',text:'text',audio:'audio',music:'audio',song:'audio'}
const num=(s,def)=>{const m=String(s||'').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):def}
const colorMap={red:'#ff3b30',blue:'#0a84ff',green:'#30d158',yellow:'#ffd60a',orange:'#ff9f0a',purple:'#bf5af2',pink:'#ff375f',white:'#ffffff',black:'#111111',gray:'#8e8e93',grey:'#8e8e93'}
export function interpretSpatialCommand(text,scene){
  const raw=String(text||'').trim(),q=raw.toLowerCase();if(!q)return{message:'Tell me what you want to build or change.',actions:[]}
  const actions=[]
  if(/scavenger|treasure hunt|hunt/.test(q))actions.push({type:'set-hunt',enabled:true})
  if(/turn off.*hunt|disable.*hunt/.test(q))actions.push({type:'set-hunt',enabled:false})
  if(/use (my|current) location|drop (it|this|object) here|place (it|this) here/.test(q))actions.push({type:'use-current-location'})
  const add=q.match(/add (?:a |an )?(3d model|model|image|photo|picture|video|web panel|website|browser|text|audio|music|song)/)
  if(add){const k=add[1].replace('3d ','').replace(' panel','');actions.push({type:'add-object',objectType:TYPES[k]||'text'})}
  const url=raw.match(/https:\/\/[^\s]+/i)?.[0];if(url&&/(replace|swap|change|use).*(image|photo|video|audio|music|website|web|media|source|url)/i.test(raw))actions.push({type:'patch-selected',patch:{src:url}})
  const color=Object.keys(colorMap).find(c=>new RegExp(`\\b${c}\\b`).test(q));if(color&&/(make|change|color|tint)/.test(q))actions.push({type:'patch-selected',patch:{color:colorMap[color]}})
  if(/stand.*upright|upright/.test(q))actions.push({type:'patch-selected-nested',key:'rotation',patch:{x:0,y:0,z:0}})
  if(/rotate/.test(q)){const d=num(q,90);actions.push({type:'patch-selected-nested',key:'rotation',patch:{y:d}})}
  if(/(?:make|scale|resize).*(?:bigger|larger|huge|giant)/.test(q)){const s=num(q,2);actions.push({type:'patch-selected-nested',key:'scale',patch:{x:s,y:s,z:s}})}
  if(/(?:make|scale|resize).*(?:smaller|tiny)/.test(q)){const s=num(q,.5);actions.push({type:'patch-selected-nested',key:'scale',patch:{x:s,y:s,z:s}})}
  const radius=q.match(/(?:reveal|show|appear).*?(\d+(?:\.\d+)?)\s*(?:m|meter|meters)/);if(radius)actions.push({type:'patch-selected-nested',key:'geo',patch:{enabled:true,revealRadius:Number(radius[1])}})
  const textMatch=raw.match(/(?:say|show text|text says?)\s+["“]?(.+?)["”]?$/i);if(textMatch)actions.push({type:'add-text',text:textMatch[1]})
  if(/save|publish|make.*qr|create.*qr/.test(q))actions.push({type:'publish'})
  if(/test.*ar|open.*ar|real world|camera/.test(q))actions.push({type:'open-ar'})
  const message=actions.length?`I found ${actions.length} change${actions.length===1?'':'s'} to apply.`:'I can add objects, replace linked media, resize/rotate/recolor them, place them at your location, build hunts, and publish QR scenes. Try “add a video here and make it reveal within 25 meters.”'
  return{message,actions}
}
