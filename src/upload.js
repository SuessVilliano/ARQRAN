import {createClient} from '@supabase/supabase-js'

export async function uploadGlb(file){
  const r=await fetch('/api/upload-url',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename:file.name,size:file.size,contentType:file.type||'model/gltf-binary'})})
  const d=await r.json()
  if(!r.ok) throw new Error(d.error||'Could not prepare upload')
  const url=import.meta.env.VITE_SUPABASE_URL
  const anon=import.meta.env.VITE_SUPABASE_ANON_KEY
  if(!url||!anon) throw new Error('Public Supabase browser settings are not configured')
  const client=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}})
  const {error}=await client.storage.from(d.bucket).uploadToSignedUrl(d.path,d.token,file,{contentType:file.type||'model/gltf-binary'})
  if(error) throw error
  return d.publicUrl
}
