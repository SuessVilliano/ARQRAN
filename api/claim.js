import {db} from './_lib/supabase.js'

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  try{
    const {sceneId,token}=req.body||{}
    if(!sceneId||!token) return res.status(400).json({error:'sceneId and token are required'})
    const {data,error}=await db().rpc('claim_ar_collectible',{p_scene_slug:sceneId,p_device_token:token})
    if(error){
      const msg=error.message||'Claim failed'
      if(msg.includes('All collectibles')) return res.status(409).json({error:msg})
      if(msg.includes('disabled')||msg.includes('not found')) return res.status(400).json({error:msg})
      throw error
    }
    return res.status(200).json(data)
  }catch(e){return res.status(500).json({error:e.message})}
}
