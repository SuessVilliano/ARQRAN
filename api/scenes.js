import {db} from './_lib/supabase.js'

export default async function handler(req,res){
  try{
    const client=db()
    if(req.method==='GET'){
      const {data,error}=await client.from('ar_scenes').select('*').order('updated_at',{ascending:false}).limit(100)
      if(error) throw error
      return res.status(200).json({scenes:data})
    }
    return res.status(405).json({error:'Method not allowed'})
  }catch(e){return res.status(500).json({error:e.message})}
}
