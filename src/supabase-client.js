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
