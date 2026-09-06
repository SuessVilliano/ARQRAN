import {createClient} from '@supabase/supabase-js'

const url=import.meta.env.VITE_SUPABASE_URL
const key=import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase=(url&&key)?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null

export async function getAccessToken(){
  if(!supabase)return null
  const {data}=await supabase.auth.getSession()
  return data.session?.access_token||null
}

export async function authHeaders(extra={}){
  const token=await getAccessToken()
  return {...extra,...(token?{Authorization:`Bearer ${token}`}:{})}
}

export function installAuthenticatedApiFetch(){
  if(window.__arqranAuthFetchInstalled)return
  window.__arqranAuthFetchInstalled=true
  const original=window.fetch.bind(window)
  window.fetch=async(input,init={})=>{
    const urlValue=typeof input==='string'?input:input?.url||''
    const sameOriginApi=urlValue.startsWith('/api/')||urlValue.startsWith(`${location.origin}/api/`)
    if(!sameOriginApi)return original(input,init)
    const token=await getAccessToken().catch(()=>null)
    const headers=new Headers(init.headers||(typeof input!=='string'?input.headers:undefined)||{})
    if(token&&!headers.has('Authorization'))headers.set('Authorization',`Bearer ${token}`)
    return original(input,{...init,headers})
  }
}
