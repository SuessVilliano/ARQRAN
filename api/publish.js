import {createDynamicLink,createQr} from './_lib/sqr.js'
import {upsertScene} from './_lib/supabase.js'

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  try{
    const {scene,qrStyle='rounded'}=req.body||{}
    if(!scene?.slug||!scene?.title||!scene?.publicUrl||!scene?.src) return res.status(400).json({error:'scene.slug, title, src and publicUrl are required'})
    const projectId=process.env.SQR_PROJECT_ID||null
    const domainId=process.env.SQR_DOMAIN_ID||null
    const link=await createDynamicLink({locationUrl:scene.publicUrl,slug:scene.slug,projectId,domainId})
    if(!link.linkId) throw new Error('SQR did not return a link ID')
    const qr=await createQr({name:`ARQRAN · ${scene.title}`,linkId:link.linkId,projectId,style:qrStyle})
    const sqr={linkId:link.linkId,qrId:qr.qrId,shortUrl:link.shortUrl,qrUrl:qr.qrUrl}
    const saved=await upsertScene(scene,sqr)
    return res.status(200).json({...sqr,scene:saved})
  }catch(e){
    return res.status(e.status||500).json({error:e.message,details:e.data||undefined})
  }
}
