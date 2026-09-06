export const OBJECT_TYPES=['model','image','video','web','text','audio']

export const newObject=(type='model',overrides={})=>({
  id:crypto.randomUUID(),
  type,
  name:`${type[0].toUpperCase()+type.slice(1)} object`,
  src:'',
  text:'',
  position:{x:0,y:1.4,z:-2},
  rotation:{x:0,y:0,z:0},
  scale:{x:1,y:1,z:1},
  color:'#ffffff',
  opacity:1,
  autoplay:type==='video'||type==='audio',
  loop:type==='video'||type==='audio',
  muted:type==='video',
  anchor:{type:'scene',target:''},
  geo:{enabled:false,lat:null,lng:null,revealRadius:25,warmRadius:150,nearRadius:500},
  interaction:{action:'none',url:''},
  ...overrides
})

export const sanitizeObject=(obj={})=>({
  id:String(obj.id||crypto.randomUUID()),
  type:OBJECT_TYPES.includes(obj.type)?obj.type:'text',
  name:String(obj.name||'Object').slice(0,120),
  src:String(obj.src||''),
  text:String(obj.text||'').slice(0,4000),
  position:{x:Number(obj.position?.x)||0,y:Number(obj.position?.y)||0,z:Number(obj.position?.z)||0},
  rotation:{x:Number(obj.rotation?.x)||0,y:Number(obj.rotation?.y)||0,z:Number(obj.rotation?.z)||0},
  scale:{x:Math.max(.01,Number(obj.scale?.x)||1),y:Math.max(.01,Number(obj.scale?.y)||1),z:Math.max(.01,Number(obj.scale?.z)||1)},
  color:/^#[0-9a-f]{6}$/i.test(obj.color||'')?obj.color:'#ffffff',
  opacity:Math.max(0,Math.min(1,Number(obj.opacity??1))),
  autoplay:Boolean(obj.autoplay),
  loop:Boolean(obj.loop),
  muted:Boolean(obj.muted),
  anchor:{type:['scene','gps','image','qr','spatial'].includes(obj.anchor?.type)?obj.anchor.type:'scene',target:String(obj.anchor?.target||'')},
  geo:{
    enabled:Boolean(obj.geo?.enabled),
    lat:Number.isFinite(Number(obj.geo?.lat))?Number(obj.geo.lat):null,
    lng:Number.isFinite(Number(obj.geo?.lng))?Number(obj.geo.lng):null,
    revealRadius:Math.max(3,Number(obj.geo?.revealRadius)||25),
    warmRadius:Math.max(10,Number(obj.geo?.warmRadius)||150),
    nearRadius:Math.max(25,Number(obj.geo?.nearRadius)||500)
  },
  interaction:{action:['none','open-url','claim'].includes(obj.interaction?.action)?obj.interaction.action:'none',url:String(obj.interaction?.url||'')}
})

export const sanitizeScene=(scene={})=>({
  title:String(scene.title||'Untitled AR scene').slice(0,120),
  slug:String(scene.slug||'scene').slice(0,64),
  description:String(scene.description||'').slice(0,500),
  claimLimit:Math.max(0,Number(scene.claimLimit)||0),
  hunt:{enabled:Boolean(scene.hunt?.enabled),name:String(scene.hunt?.name||''),showBearing:scene.hunt?.showBearing!==false},
  objects:(scene.objects||[]).slice(0,50).map(sanitizeObject)
})
