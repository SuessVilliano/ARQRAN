const BASE=(process.env.SQR_API_BASE_URL||'https://sqr.co/api').replace(/\/$/,'')

function key(){
  if(!process.env.SQR_API_KEY) throw new Error('SQR_API_KEY is not configured')
  return process.env.SQR_API_KEY
}

async function call(path,options={}){
  const r=await fetch(`${BASE}${path}`,{...options,headers:{Authorization:`Bearer ${key()}`,Accept:'application/json',...(options.headers||{})}})
  const text=await r.text()
  let data
  try{data=JSON.parse(text)}catch{data={raw:text}}
  if(!r.ok){const e=new Error(data?.message||data?.error||`SQR request failed (${r.status})`);e.status=r.status;e.data=data;throw e}
  return data
}

export function buildLinkForm({locationUrl,slug,projectId,domainId}){
  const form=new FormData()
  form.set('location_url',locationUrl)
  if(slug) form.set('url',slug)
  if(projectId) form.set('project_id',String(projectId))
  if(domainId) form.set('domain_id',String(domainId))
  form.set('utm_source','arqran')
  form.set('utm_medium','qr')
  return form
}

export function buildQrForm({name,linkId,projectId,style='rounded'}){
  const form=new FormData()
  form.set('name',name)
  form.set('type','url')
  form.set('style',style)
  form.set('foreground_type','color')
  form.set('foreground_color','#000000')
  form.set('background_color','#ffffff')
  form.set('link_id',String(linkId))
  if(projectId) form.set('project_id',String(projectId))
  return form
}

function first(obj,keys){for(const k of keys){if(obj?.[k]!==undefined&&obj?.[k]!==null)return obj[k]}return null}

export async function createDynamicLink(input){
  const data=await call('/links',{method:'POST',body:buildLinkForm(input)})
  return {raw:data,linkId:first(data,['id','link_id']),shortUrl:first(data,['short_url','url','link','full_url'])}
}

export async function updateDynamicLink(id,locationUrl){
  const form=new FormData();form.set('location_url',locationUrl)
  const data=await call(`/links/${encodeURIComponent(id)}`,{method:'POST',body:form})
  return {raw:data,linkId:id,shortUrl:first(data,['short_url','url','link','full_url'])}
}

export async function createQr(input){
  const data=await call('/qr-codes',{method:'POST',body:buildQrForm(input)})
  return {raw:data,qrId:first(data,['id','qr_id']),qrUrl:first(data,['svg_url','qr_code_url','url','image_url','download_url'])}
}
