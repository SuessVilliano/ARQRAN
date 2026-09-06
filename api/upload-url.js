import {db} from './_lib/supabase.js'

const safe=(v='asset.glb')=>v.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(-120)||'asset.glb'
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  try{
    const {filename,contentType,size}=req.body||{}
    if(!filename||!/\.glb$/i.test(filename)) return res.status(400).json({error:'Only .glb uploads are accepted in the MVP'})
    if(Number(size)>100*1024*1024) return res.status(413).json({error:'File exceeds 100 MB limit'})
    const bucket=process.env.SUPABASE_ASSET_BUCKET||'ar-assets'
    const path=`models/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}-${safe(filename)}`
    const client=db()
    const {data,error}=await client.storage.from(bucket).createSignedUploadUrl(path)
    if(error) throw error
    const {data:pub}=client.storage.from(bucket).getPublicUrl(path)
    return res.status(200).json({bucket,path,token:data.token,signedUrl:data.signedUrl,publicUrl:pub.publicUrl,contentType:contentType||'model/gltf-binary'})
  }catch(e){return res.status(500).json({error:e.message})}
}
