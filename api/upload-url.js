import {db} from './_lib/supabase.js'

const safe=(v='asset.bin')=>v.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(-120)||'asset.bin'
const allowedExt=/\.(glb|png|jpe?g|webp|gif|mp4|webm|mov|m4v|mp3|m4a|wav|ogg)$/i
const kind=(name='')=>/\.glb$/i.test(name)?'models':/\.(png|jpe?g|webp|gif)$/i.test(name)?'images':/\.(mp4|webm|mov|m4v)$/i.test(name)?'video':'audio'
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  try{
    const {filename,contentType,size}=req.body||{}
    if(!filename||!allowedExt.test(filename)) return res.status(400).json({error:'Supported uploads: GLB, PNG/JPG/WebP/GIF, MP4/WebM/MOV, MP3/M4A/WAV/OGG'})
    if(Number(size)>150*1024*1024) return res.status(413).json({error:'File exceeds 150 MB limit'})
    const bucket=process.env.SUPABASE_ASSET_BUCKET||'ar-assets'
    const path=`${kind(filename)}/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}-${safe(filename)}`
    const client=db()
    const {data,error}=await client.storage.from(bucket).createSignedUploadUrl(path)
    if(error) throw error
    const {data:pub}=client.storage.from(bucket).getPublicUrl(path)
    return res.status(200).json({bucket,path,token:data.token,signedUrl:data.signedUrl,publicUrl:pub.publicUrl,contentType:contentType||'application/octet-stream'})
  }catch(e){return res.status(500).json({error:e.message})}
}
