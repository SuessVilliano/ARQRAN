import {db} from './_lib/supabase.js'

const ALLOWED=new Set(['scene_open','ar_button','ar_session','geo_unlock','geo_denied','cta','claim','click','download','map_open','media_play','media_complete','pwa_install','embed_ready'])
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  try{
    const {sceneId,type,meta={}}=req.body||{}
    if(!sceneId||!ALLOWED.has(type)) return res.status(400).json({error:'Valid sceneId and event type are required'})
    const client=db()
    const {data:event,error}=await client.from('ar_events').insert({scene_slug:sceneId,event_type:type,meta,user_agent:req.headers['user-agent']||null,ip_hash:null}).select('id').single()
    if(error) throw error
    const {data:integrations}=await client.from('ar_integrations').select('id').eq('enabled',true).or(`scene_slug.eq.${sceneId},scene_slug.is.null`)
    if(integrations?.length) await client.from('ar_event_deliveries').insert(integrations.map(i=>({event_id:event.id,integration_id:i.id,status:'pending'})))
    return res.status(204).end()
  }catch(e){return res.status(500).json({error:e.message})}
}
