import {db} from './_lib/supabase.js'

const ALLOWED=new Set(['scene_open','ar_button','ar_session','geo_unlock','geo_denied','cta','claim'])
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  try{
    const {sceneId,type,meta={}}=req.body||{}
    if(!sceneId||!ALLOWED.has(type)) return res.status(400).json({error:'Valid sceneId and event type are required'})
    const {error}=await db().from('ar_events').insert({scene_slug:sceneId,event_type:type,meta,user_agent:req.headers['user-agent']||null,ip_hash:null})
    if(error) throw error
    return res.status(204).end()
  }catch(e){return res.status(500).json({error:e.message})}
}
