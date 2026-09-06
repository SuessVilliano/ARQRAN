import {listDomains,findDomainId} from './_lib/sqr.js'

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'})
  try{
    const domains=await listDomains()
    const domainId=process.env.SQR_DOMAIN_ID||await findDomainId(process.env.SQR_SCAN_HOST||'scan.liv8.co')
    return res.status(200).json({ok:true,apiBase:process.env.SQR_API_BASE_URL||'https://sqr.co/api',scanHost:process.env.SQR_SCAN_HOST||'scan.liv8.co',domainId:domainId||null,domainCount:domains.length})
  }catch(e){return res.status(e.status||500).json({ok:false,error:e.message})}
}
