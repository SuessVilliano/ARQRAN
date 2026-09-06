import {db} from './_lib/supabase.js'

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  try{
    const {sceneId,token}=req.body||{}
    if(!sceneId||!token) return res.status(400).json({error:'sceneId and token are required'})
    const client=db()
    const {data:scene,error:sceneErr}=await client.from('ar_scenes').select('claim_limit').eq('slug',sceneId).single()
    if(sceneErr) throw sceneErr
    const limit=Number(scene.claim_limit)||0
    if(limit<=0) return res.status(400).json({error:'Claims are disabled for this scene'})
    const {data:existing}=await client.from('ar_claims').select('id').eq('scene_slug',sceneId).eq('device_token',token).maybeSingle()
    if(existing) {
      const {count}=await client.from('ar_claims').select('*',{count:'exact',head:true}).eq('scene_slug',sceneId)
      return res.status(200).json({duplicate:true,remaining:Math.max(0,limit-(count||0))})
    }
    const {count}=await client.from('ar_claims').select('*',{count:'exact',head:true}).eq('scene_slug',sceneId)
    if((count||0)>=limit) return res.status(409).json({error:'All collectibles have been claimed'})
    const {error}=await client.from('ar_claims').insert({scene_slug:sceneId,device_token:token})
    if(error){if(error.code==='23505')return res.status(200).json({duplicate:true,remaining:Math.max(0,limit-(count||0))});throw error}
    await client.from('ar_events').insert({scene_slug:sceneId,event_type:'claim',meta:{}})
    return res.status(200).json({duplicate:false,remaining:Math.max(0,limit-(count||0)-1)})
  }catch(e){return res.status(500).json({error:e.message})}
}
