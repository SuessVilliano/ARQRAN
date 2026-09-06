const allowed=['add-object','add-text','set-hunt','patch-selected','patch-selected-nested','use-current-location','publish','open-ar']
const cleanActions=actions=>(Array.isArray(actions)?actions:[]).filter(a=>allowed.includes(a?.type)).slice(0,8)
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
  const {instruction,scene}=req.body||{}
  if(!instruction)return res.status(400).json({error:'instruction is required'})
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI model is not configured; client fallback will be used.'})
  try{
    const system=`You are ARIA, the natural-language scene editor for ARQRAN. Convert the user's request into safe scene-edit actions. Return JSON only: {"message":"short friendly confirmation","actions":[...]}. Allowed actions: add-object {objectType:model|image|video|web|text|audio}; add-text {text}; set-hunt {enabled}; patch-selected {patch:{color?,name?}}; patch-selected-nested {key:position|rotation|scale|geo|anchor,patch:{...}}; use-current-location; publish; open-ar. Do not invent URLs, coordinates, files or media. If the user asks to create imagery, explain that ARIA can place/edit/replace uploaded or linked media but cannot fabricate a new asset inside this command. Keep actions minimal.`
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5.6-luna',input:[{role:'system',content:system},{role:'user',content:`Scene: ${JSON.stringify(scene||{})}\nRequest: ${instruction}`}],max_output_tokens:700})})
    const d=await r.json();if(!r.ok)throw new Error(d?.error?.message||`OpenAI request failed (${r.status})`)
    const text=d.output_text||d.output?.flatMap?.(x=>x.content||[])?.map?.(x=>x.text||'')?.join('')||''
    const parsed=JSON.parse(text.replace(/^```json\s*|```$/g,'').trim())
    return res.status(200).json({message:String(parsed.message||'Done.'),actions:cleanActions(parsed.actions)})
  }catch(e){return res.status(500).json({error:e.message})}
}
