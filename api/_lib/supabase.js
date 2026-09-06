import {createClient} from '@supabase/supabase-js'

export function db(){
  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key) throw new Error('Supabase server credentials are not configured')
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
}

export async function upsertScene(scene, sqr={}){
  const client=db()
  const row={slug:scene.slug,title:scene.title,public_url:scene.publicUrl||null,src:scene.src,assets:scene.assets||[],settings:scene.settings||{},trigger:scene.trigger||{type:'qr'},claim_limit:Number(scene.claimLimit)||0,sqr_link_id:sqr.linkId||null,sqr_qr_id:sqr.qrId||null,sqr_short_url:sqr.shortUrl||null,sqr_qr_url:sqr.qrUrl||null,updated_at:new Date().toISOString()}
  const {data,error}=await client.from('ar_scenes').upsert(row,{onConflict:'slug'}).select().single()
  if(error) throw error
  return data
}
