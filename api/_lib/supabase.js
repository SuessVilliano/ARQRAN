import {createClient} from '@supabase/supabase-js'

export function db(){
  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key) throw new Error('Supabase server credentials are not configured')
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
}

async function syncAnchors(client,scene,ownerId){
  const rows=(scene.objects||[]).map(o=>({
    scene_slug:scene.slug,
    object_id:String(o.id),
    owner_id:ownerId||null,
    anchor_type:o.anchor?.type||'scene',
    latitude:Number.isFinite(Number(o.geo?.lat))?Number(o.geo.lat):null,
    longitude:Number.isFinite(Number(o.geo?.lng))?Number(o.geo.lng):null,
    altitude:Number.isFinite(Number(o.geo?.altitude))?Number(o.geo.altitude):null,
    accuracy_meters:Number.isFinite(Number(o.geo?.accuracy))?Number(o.geo.accuracy):null,
    target:o.anchor?.target||null,
    transform:{position:o.position||{},rotation:o.rotation||{},scale:o.scale||{}},
    metadata:{geo:o.geo||{},interaction:o.interaction||{},type:o.type},
    updated_at:new Date().toISOString()
  }))
  if(!rows.length)return
  const {error}=await client.from('ar_anchors').upsert(rows,{onConflict:'scene_slug,object_id'})
  if(error&&error.code!=='42P01')throw error
}

export async function upsertScene(scene,sqr={},ownerId=null){
  const client=db()
  const {data:existing,error:existingError}=await client.from('ar_scenes').select('owner_id').eq('slug',scene.slug).maybeSingle()
  if(existingError)throw existingError
  if(existing?.owner_id&&ownerId&&existing.owner_id!==ownerId){const e=new Error('That scene URL is already owned by another account. Choose a different slug.');e.status=409;throw e}
  const firstModel=(scene.objects||[]).find(o=>o.type==='model'&&o.src)
  const row={
    slug:scene.slug,
    owner_id:ownerId||existing?.owner_id||null,
    title:scene.title,
    description:scene.description||'',
    public_url:scene.publicUrl||null,
    src:firstModel?.src||scene.src||null,
    assets:scene.assets||[],
    objects:scene.objects||[],
    settings:scene.settings||{},
    trigger:scene.trigger||{type:'qr'},
    hunt:scene.hunt||{enabled:false},
    claim_limit:Number(scene.claimLimit)||0,
    sqr_link_id:sqr.linkId||null,
    sqr_qr_id:sqr.qrId||null,
    sqr_short_url:sqr.shortUrl||null,
    sqr_qr_url:sqr.qrUrl||null,
    updated_at:new Date().toISOString()
  }
  const {data,error}=await client.from('ar_scenes').upsert(row,{onConflict:'slug'}).select().single()
  if(error) throw error
  await syncAnchors(client,scene,row.owner_id)
  return data
}

export async function getScene(slug){
  const {data,error}=await db().from('ar_scenes').select('*').eq('slug',slug).single()
  if(error) throw error
  return data
}
