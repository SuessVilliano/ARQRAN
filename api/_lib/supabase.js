import {createClient} from '@supabase/supabase-js'

export function db(){
  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key) throw new Error('Supabase server credentials are not configured')
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
}

export async function upsertScene(scene, sqr={}){
  const client=db()
  const firstModel=(scene.objects||[]).find(o=>o.type==='model'&&o.src)
  const row={
    slug:scene.slug,
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
  return data
}

export async function getScene(slug){
  const {data,error}=await db().from('ar_scenes').select('*').eq('slug',slug).single()
  if(error) throw error
  return data
}
