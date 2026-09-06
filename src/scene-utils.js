export const MAX_FILES = 20
export const MAX_TOTAL_BYTES = 100 * 1024 * 1024

export function slugify(value='scene') {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64) || 'scene'
}

export function isPublicHttps(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !['localhost','127.0.0.1','0.0.0.0'].includes(url.hostname)
  } catch { return false }
}

export function validateAdd(existingCount, existingBytes, incoming=[]) {
  const bytes = incoming.reduce((s,f)=>s+(Number(f.size)||0),0)
  if (existingCount + incoming.length > MAX_FILES) return {ok:false,error:`Limit is ${MAX_FILES} assets per scene.`}
  if (existingBytes + bytes > MAX_TOTAL_BYTES) return {ok:false,error:'Keep total local scene assets under 100 MB.'}
  return {ok:true}
}

export function buildSceneUrl(base, scene) {
  if (!isPublicHttps(base)) throw new Error('A public HTTPS AR base URL is required before publishing.')
  const url = new URL(base)
  url.pathname = `/x/${slugify(scene.slug || scene.title || 'scene')}`
  url.search = ''
  url.hash = ''
  return url.toString()
}

export function hexToFactor(hex='#ffffff') {
  const clean = String(hex).replace('#','').trim()
  const normalized = clean.length === 3 ? clean.split('').map(c=>c+c).join('') : clean
  if(!/^[0-9a-f]{6}$/i.test(normalized)) return [1,1,1,1]
  return [0,2,4].map(i=>parseInt(normalized.slice(i,i+2),16)/255).concat(1)
}

export function haversineMeters(a,b) {
  const R=6371000
  const rad=d=>d*Math.PI/180
  const dLat=rad(b.lat-a.lat), dLng=rad(b.lng-a.lng)
  const x=Math.sin(dLat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2
  return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))
}

export function bearingDegrees(a,b){
  const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI
  const p1=rad(a.lat),p2=rad(b.lat),dl=rad(b.lng-a.lng)
  const y=Math.sin(dl)*Math.cos(p2)
  const x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl)
  return (deg(Math.atan2(y,x))+360)%360
}

export function cardinal(deg){
  const dirs=['N','NE','E','SE','S','SW','W','NW']
  return dirs[Math.round(((Number(deg)||0)%360)/45)%8]
}

export function withinGeofence(user,target,radius=100) {
  return haversineMeters(user,target) <= Number(radius)
}
