import {db,upsertScene} from './_lib/supabase.js'

export default async function handler(req,res){
  try{
    const client=db()
    if(req.method==='GET'){
      const slug=String(req.query?.slug||'').trim()
      if(slug){
        const {data,error}=await client.from('ar_scenes').select('*').eq('slug',slug).single()
        if(error) return res.status(error.code==='PGRST116'?404:500).json({error:error.message})
        return res.status(200).json({scene:data})
      }
      const {data,error}=await client.from('ar_scenes').select('*').order('updated_at',{ascending:false}).limit(100)
      if(error) throw error
      return res.status(200).json({scenes:data})
    }
    if(req.method==='POST'){
      const {scene}=req.body||{}
      if(!scene?.slug||!scene?.title) return res.status(400).json({error:'scene.slug and scene.title are required'})
      if(!Array.isArray(scene.objects)||scene.objects.length===0) return res.status(400).json({error:'Add at least one object before saving'})
      const saved=await upsertScene(scene,{})
      return res.status(200).json({scene:saved})
    }
    return res.status(405).json({error:'Method not allowed'})
  }catch(e){return res.status(500).json({error:e.message})}
}
