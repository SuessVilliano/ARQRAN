import {createDynamicLink,createQr,findDomainId} from './_lib/sqr.js'
import {upsertScene} from './_lib/supabase.js'

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  try{
    const {scene,qrStyle='rounded'}=req.body||{}
    if(!scene?.slug||!scene?.title||!scene?.publicUrl) return res.status(400).json({error:'scene.slug, title and publicUrl are required'})
    if(!Array.isArray(scene.objects)||scene.objects.length===0) return res.status(400).json({error:'Add at least one scene object before publishing'})
    const projectId=process.env.SQR_PROJECT_ID||null
    let domainId=process.env.SQR_DOMAIN_ID||null
    if(!domainId){try{domainId=await findDomainId(process.env.SQR_SCAN_HOST||'scan.liv8.co')}catch{}}
    const link=await createDynamicLink({locationUrl:scene.publicUrl,slug:scene.slug,projectId,domainId})
    if(!link.linkId) throw new Error('SQR did not return a link ID')
    const qr=await createQr({name:`ARQRAN · ${scene.title}`,linkId:link.linkId,projectId,style:qrStyle})
    const sqr={linkId:link.linkId,qrId:qr.qrId,shortUrl:link.shortUrl,qrUrl:qr.qrUrl,domainId:domainId||null}
    const saved=await upsertScene(scene,sqr)
    return res.status(200).json({...sqr,scene:saved})
  }catch(e){
    return res.status(e.status||500).json({error:e.message,details:e.data||undefined})
  }
}
