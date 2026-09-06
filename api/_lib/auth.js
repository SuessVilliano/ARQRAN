import {db} from './supabase.js'

export async function requireUser(req){
  const header=String(req.headers?.authorization||req.headers?.Authorization||'')
  const token=header.startsWith('Bearer ')?header.slice(7).trim():''
  if(!token){const e=new Error('Log in to continue');e.status=401;throw e}
  const {data,error}=await db().auth.getUser(token)
  if(error||!data?.user){const e=new Error('Your session is invalid or expired');e.status=401;throw e}
  return data.user
}
