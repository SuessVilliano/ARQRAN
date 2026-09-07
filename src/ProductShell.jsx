import React,{useEffect,useState} from 'react'
import SpatialPassthrough from './SpatialPassthrough.jsx'
import {supabase} from './supabase-client.js'
import './product-shell.css'

const BETA_MODE=true
const plans=[
 {name:'Free',price:'$0',tag:'Explore AR',features:['3 saved scenes','250 scans / month','3D, image, video, text & audio','ARQRAN branded links'],cta:'Start free'},
 {name:'Creator',price:'$19',tag:'Best for creators',popular:true,features:['25 saved scenes','10,000 scans / month','ARIA AI scene help','Custom QR styling','Location hunts & analytics'],cta:'Choose Creator'},
 {name:'Pro',price:'$49',tag:'For brands & pros',features:['100 saved scenes','50,000 scans / month','CRM + webhook events','Custom scan domain','Advanced analytics & exports'],cta:'Choose Pro'},
 {name:'Agency',price:'$99',tag:'For client work',features:['500 saved scenes','250,000 scans / month','GHL iframe / white-label workspace','Team & client workspaces','Priority support'],cta:'Choose Agency'}
]

function ThemeToggle({theme,setTheme}){return <button className="themeToggle" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label="Toggle light mode">{theme==='dark'?'☀︎':'☾'}<span>{theme==='dark'?'Light':'Dark'}</span></button>}
function BetaPill(){return BETA_MODE?<div className="betaPill">BETA · Guest access enabled</div>:null}

function Landing({session,theme,setTheme}){
 const goStudio=()=>location.assign('/studio')
 return <main className="marketingPage">
  <nav className="marketingNav"><a className="brand" href="/"><span className="brandOrb">◉</span>ARQRAN</a><div className="navLinks"><a href="#how">How it works</a><a href="#ideas">Ideas</a><a href="#pricing">Pricing</a></div><div className="navActions"><ThemeToggle theme={theme} setTheme={setTheme}/><button className="navLogin" onClick={()=>location.assign(session?'/studio':'/login')}>{session?'Studio':'Log in'}</button><button className="navPrimary" onClick={goStudio}>Start building</button></div></nav>
  <section className="hero"><div className="heroGlow g1"/><div className="heroGlow g2"/><div className="bubble b1"/><div className="bubble b2"/><div className="bubble b3"/><div className="heroCopy"><BetaPill/><span className="kicker">THE PHYSICAL WORLD IS NOW A CANVAS</span><h1>Put digital things<br/><em>into real places.</em></h1><p>Build browser-based AR experiences with 3D characters, photos, video, music, web panels, GPS and scavenger hunts — then launch them from a QR code or location.</p><div className="heroButtons"><button className="cta" onClick={goStudio}>Create your first world →</button><a className="ghostCta" href="#how">See how it works</a></div><div className="trustRow"><span>◉ No app required</span><span>⌖ GPS aware</span><span>✦ AI assisted</span><span>▦ CRM ready</span></div></div>
   <div className="heroVisual"><div className="phone"><div className="phoneTop"/><div className="world"><div className="portalRing r1"/><div className="portalRing r2"/><div className="portalRing r3"/><div className="floatCard fc1"><b>3D</b><span>Place characters</span></div><div className="floatCard fc2"><b>VIDEO</b><span>Bring walls alive</span></div><div className="floatCard fc3"><b>GPS</b><span>Hide experiences</span></div><div className="avatarBlob">✦</div></div></div></div>
  </section>
  <section className="ticker"><span>3D MODELS</span><span>IMAGES</span><span>VIDEO</span><span>AUDIO</span><span>WEB PANELS</span><span>GPS</span><span>SCAVENGER HUNTS</span><span>QR</span></section>
  <section id="how" className="section"><div className="sectionEyebrow">BUILD • PLACE • SHARE</div><h2>From an idea to the real world in minutes.</h2><div className="stepsGrid"><article><i>01</i><h3>Build it</h3><p>Upload a GLB, image, video or audio. Add text and web panels. Use ARIA to help create and edit the experience.</p></article><article><i>02</i><h3>Place it</h3><p>Drop content where you are, choose a point on the map, or turn the scene into a location-aware hunt.</p></article><article><i>03</i><h3>Share it</h3><p>Publish a QR or link. People open it from their phone and discover the digital layer you placed in the world.</p></article></div></section>
  <section id="ideas" className="section ideaSection"><div className="sectionEyebrow">ONE ENGINE • ENDLESS WORLDS</div><h2>What would you leave behind?</h2><div className="ideaGrid">{[['👾','Scavenger hunts','Hide monsters, clues, coupons and collectibles around a city.'],['♡','Family memories','Place photos, voices and videos where moments actually happened.'],['♫','Music drops','Leave songs, spoken messages or exclusive audio at real locations.'],['◫','Spatial workspaces','Float charts, dashboards and web panels around your workspace.'],['⌂','Digital decorating','Put virtual art, signs and seasonal objects on walls and rooms.'],['◎','Brand activations','Turn stores, booths and campaigns into measurable interactive experiences.']].map(([icon,t,d])=><article key={t}><span>{icon}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>
  <section className="section aiSection"><div className="aiOrb">✦</div><div><span className="sectionEyebrow">MEET ARIA</span><h2>Describe the experience.<br/>Let AI help build it.</h2><p>“Make this 12 feet tall, place it here, turn it into a hunt, reveal it within 25 meters and publish it.”</p><button className="cta" onClick={goStudio}>Open Spatial Studio →</button></div></section>
  <section id="pricing" className="section"><div className="sectionEyebrow">FOUNDING PRICING</div><h2>Start free. Pay when AR becomes useful.</h2><p className="sectionLead">During beta, Studio access is open. Accounts are optional while we test creation, storage and sharing flows.</p><div className="pricingGrid">{plans.map(p=><article key={p.name} className={p.popular?'popular':''}>{p.popular&&<div className="popularTag">MOST POPULAR</div>}<span>{p.tag}</span><h3>{p.name}</h3><div className="price">{p.price}<small>/mo</small></div><ul>{p.features.map(f=><li key={f}>✓ {f}</li>)}</ul><button onClick={goStudio}>{p.cta}</button></article>)}</div><small className="pricingNote">Pricing is the launch structure and can be adjusted before billing is enabled.</small></section>
  <footer><a className="brand" href="/"><span className="brandOrb">◉</span>ARQRAN</a><p>Turn places into experiences.</p><ThemeToggle theme={theme} setTheme={setTheme}/></footer>
 </main>
}

function AuthPage({theme,setTheme}){
 const initialMode=location.pathname==='/signup'?'signup':'login'
 const [mode,setMode]=useState(initialMode),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[msg,setMsg]=useState('')
 async function submit(e){e.preventDefault();if(!supabase)return setMsg('Supabase browser credentials are not configured. You can still continue as a beta guest.');setBusy(true);setMsg('');try{if(mode==='signup'){const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${location.origin}/studio`}});if(error)throw error;setMsg('Account created. Check your email if confirmation is enabled.')}else{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;const next=new URLSearchParams(location.search).get('next')||'/studio';location.assign(next)}}catch(e){setMsg(e.message)}finally{setBusy(false)}}
 return <main className="authPage"><div className="authGlow"/><header><a className="brand" href="/"><span className="brandOrb">◉</span>ARQRAN</a><ThemeToggle theme={theme} setTheme={setTheme}/></header><section className="authCard"><BetaPill/><span className="kicker">YOUR SPATIAL WORKSPACE</span><h1>{mode==='login'?'Welcome back.':'Create your world.'}</h1><p>Accounts keep your scenes, files, analytics and integrations separated. Beta guest access stays available for testing.</p><button className="betaBypass" onClick={()=>location.assign('/studio')}>Continue as beta guest →</button><div className="authDivider"><span>or use an account</span></div><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength="6" autoComplete={mode==='login'?'current-password':'new-password'}/></label><button disabled={busy}>{busy?'Working…':mode==='login'?'Log in →':'Create account →'}</button></form>{msg&&<div className="authMsg">{msg}</div>}<div className="authSwitch">{mode==='login'?'New to ARQRAN?':'Already have an account?'} <button onClick={()=>{setMode(mode==='login'?'signup':'login');setMsg('')}}>{mode==='login'?'Create one':'Log in'}</button></div></section></main>
}

function BetaWorkspace({session,loading}){
 if(loading)return <div className="shellLoader">✦<span>Opening your spatial workspace…</span></div>
 return <div className="betaWorkspace"><div className="betaBar"><span><b>ARQRAN BETA</b> {session?'Signed in — your workspace is account-linked.':'Guest mode — build freely; sign in when you want account-linked storage.'}</span><div className="betaActions">{session?<button onClick={()=>location.assign('/dashboard')}>Dashboard</button>:<><button onClick={()=>location.assign('/login?next=/studio')}>Log in</button><button onClick={()=>location.assign('/signup?next=/studio')}>Create account</button></>}</div></div><SpatialPassthrough/></div>
}

export default function ProductShell(){
 const [session,setSession]=useState(null),[loading,setLoading]=useState(true),[theme,setThemeState]=useState(()=>localStorage.getItem('arqran-theme')||'dark')
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('arqran-theme',theme)},[theme])
 useEffect(()=>{if(!supabase){setLoading(false);return}supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)});const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>data.subscription.unsubscribe()},[])
 const setTheme=t=>setThemeState(t)
 const path=location.pathname
 const params=new URLSearchParams(location.search)
 if(path.startsWith('/x/')||params.has('preview'))return <SpatialPassthrough/>
 if(path==='/studio'||path.startsWith('/studio/')||path==='/dashboard'||path.startsWith('/dashboard/'))return <BetaWorkspace session={session} loading={loading}/>
 if(path==='/login'||path==='/signup')return <AuthPage theme={theme} setTheme={setTheme}/>
 return <Landing session={session} theme={theme} setTheme={setTheme}/>
}
