import React,{useEffect,useRef,useState} from 'react'
import AppV3 from './AppV3.jsx'
import './spatial-passthrough.css'
import './native-ar-restore.css'

function selectedPreview(){
  const stage=document.querySelector('.stageV2')
  if(!stage)return null
  const model=stage.querySelector('model-viewer')
  if(model?.getAttribute('src'))return{type:'model',src:model.getAttribute('src'),node:model}

  // Do not mistake AppV3's empty-state label (for example “Main 3D object”)
  // for a real text/image object. This was the source of the fake placeholder
  // appearing in camera passthrough before/after a GLB upload.
  const typeLabel=(stage.querySelector('.stageHeader span')?.textContent||'').toLowerCase()
  if(typeLabel.includes('3d model'))return null

  const image=stage.querySelector('img.spatialMedia')
  if(image?.src)return{type:'image',src:image.currentSrc||image.src}
  if(typeLabel.includes('image'))return null
  const video=stage.querySelector('video.spatialMedia')
  if(video?.src)return{type:'video',src:video.currentSrc||video.src}
  if(typeLabel.includes('video'))return null
  const web=stage.querySelector('.webPanel iframe')
  if(web?.src)return{type:'web',src:web.src}
  const audio=stage.querySelector('.audioPanel audio')
  if(audio?.src)return{type:'audio',src:audio.currentSrc||audio.src,name:stage.querySelector('.audioPanel b')?.textContent||'Audio'}
  if(typeLabel.includes('audio'))return null
  const text=stage.querySelector('.textPanel')
  if(text&&typeLabel.includes('text'))return{type:'text',text:text.textContent,color:getComputedStyle(text).color}
  return null
}

function setReactInput(input,value){
  if(!input)return false
  const descriptor=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')
  descriptor?.set?.call(input,String(value))
  input.dispatchEvent(new Event('input',{bubbles:true}))
  input.dispatchEvent(new Event('change',{bubbles:true}))
  return true
}

function savePlacementToEditor({pos,scale,rotation}){
  const editor=document.querySelector('.card.editor')
  if(!editor)return false
  const labels=[...editor.querySelectorAll('.miniLabel')]
  const group=name=>{
    const label=labels.find(x=>x.textContent.trim().toUpperCase()===name)
    return label?.nextElementSibling?.querySelectorAll?.('input')||[]
  }
  const position=group('POSITION'),rotate=group('ROTATION'),size=group('SCALE')
  const x=((pos.x-50)/50*2).toFixed(2)
  const y=((50-pos.y)/50*2+1.4).toFixed(2)
  const currentZ=position[2]?.value||'-2'
  setReactInput(position[0],x)
  setReactInput(position[1],y)
  setReactInput(position[2],currentZ)
  setReactInput(rotate[0],rotate[0]?.value||0)
  setReactInput(rotate[1],rotate[1]?.value||0)
  setReactInput(rotate[2],rotation)
  setReactInput(size[0],scale)
  setReactInput(size[1],scale)
  setReactInput(size[2],scale)
  return true
}

function SpatialOverlay({item,onClose}){
  const videoRef=useRef(null)
  const [error,setError]=useState(''),[scale,setScale]=useState(1),[rotation,setRotation]=useState(0),[pos,setPos]=useState({x:50,y:50}),[saved,setSaved]=useState('')
  const drag=useRef(null),pinch=useRef(null)
  useEffect(()=>{let stream
    if(!navigator.mediaDevices?.getUserMedia){setError('Camera access is not supported in this browser.');return}
    navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}).then(s=>{stream=s;if(videoRef.current){videoRef.current.srcObject=s;videoRef.current.play().catch(()=>{})}}).catch(e=>setError(e.message||'Camera permission is required.'))
    return()=>stream?.getTracks?.().forEach(t=>t.stop())
  },[])
  const start=e=>{
    if(e.touches?.length===2){const [a,b]=e.touches;pinch.current={distance:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),scale};return}
    const p=e.touches?.[0]||e;drag.current={x:p.clientX,y:p.clientY,px:pos.x,py:pos.y}
  }
  const move=e=>{
    if(e.touches?.length===2&&pinch.current){const [a,b]=e.touches;const distance=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);setScale(Math.max(.2,Math.min(5,pinch.current.scale*(distance/pinch.current.distance))));return}
    if(!drag.current)return
    const p=e.touches?.[0]||e,dx=(p.clientX-drag.current.x)/innerWidth*100,dy=(p.clientY-drag.current.y)/innerHeight*100
    setPos({x:Math.max(5,Math.min(95,drag.current.px+dx)),y:Math.max(8,Math.min(92,drag.current.py+dy))})
  }
  const end=()=>{drag.current=null;pinch.current=null}
  const save=()=>{const ok=savePlacementToEditor({pos,scale,rotation});setSaved(ok?'Placement copied into the selected object. Tap Save scene to persist it.':'Could not find the object editor. Return to Build and try again.')}
  return <div className="spatialLive" onMouseMove={move} onMouseUp={end} onTouchMove={move} onTouchEnd={end}>
    <video ref={videoRef} className="spatialLiveCamera" playsInline muted/>
    <div className="spatialLiveHud"><button onClick={onClose}>×</button><div><b>REAL-WORLD EDIT</b><span>Drag • pinch • rotate • save</span></div><button onClick={()=>setPos({x:50,y:50})}>Center</button></div>
    {error?<div className="spatialLiveError">{error}</div>:<div className="spatialLiveObject" onMouseDown={start} onTouchStart={start} style={{left:`${pos.x}%`,top:`${pos.y}%`,transform:`translate(-50%,-50%) rotate(${rotation}deg) scale(${scale})`}}>
      {item.type==='image'&&<img src={item.src} alt="Spatial object"/>}
      {item.type==='video'&&<video src={item.src} autoPlay loop muted playsInline/>}
      {item.type==='web'&&<iframe src={item.src} title="Spatial web panel"/>}
      {item.type==='text'&&<div className="spatialLiveText" style={{color:item.color}}>{item.text}</div>}
      {item.type==='audio'&&<div className="spatialLiveAudio"><span>♫</span><b>{item.name}</b><audio src={item.src} controls autoPlay/></div>}
    </div>}
    {saved&&<div className="spatialSaved">{saved}</div>}
    <div className="spatialLiveControls"><button onClick={()=>setScale(v=>Math.max(.2,v-.2))}>−</button><span>{scale.toFixed(1)}×</span><button onClick={()=>setScale(v=>Math.min(5,v+.2))}>＋</button><button onClick={()=>setRotation(v=>v-15)}>↺</button><button onClick={()=>setRotation(v=>v+15)}>↻</button><button className="savePlacement" onClick={save}>Save Placement</button></div>
  </div>
}

export default function SpatialPassthrough(){
  const [available,setAvailable]=useState(null),[live,setLive]=useState(null),[arError,setArError]=useState('')
  useEffect(()=>{const check=()=>setAvailable(selectedPreview());check();const o=new MutationObserver(check);o.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src','class']});const id=setInterval(check,400);return()=>{o.disconnect();clearInterval(id)}},[])

  async function openRealWorld(){
    const item=selectedPreview()
    setArError('')
    if(!item){setArError('Upload the selected object first.');return}
    if(item.type==='model'){
      // Use the exact model-viewer instance that is displaying the uploaded GLB.
      // This matches the original working prototype instead of creating a
      // second hidden/placeholder model-viewer for iOS Quick Look.
      try{
        const viewer=item.node
        if(!viewer?.getAttribute('src'))throw new Error('The uploaded GLB is not loaded yet.')
        await viewer.updateComplete
        await viewer.activateAR()
      }catch(e){
        try{
          const button=item.node?.querySelector('button[slot="ar-button"]')
          if(button){button.click();return}
        }catch{}
        setArError(e?.message||'Could not start AR for the uploaded GLB.')
      }
      return
    }
    setLive(item)
  }

  return <>
    <AppV3/>
    {available&&<button className="realWorldFab" onClick={openRealWorld}>◎ Real World</button>}
    {arError&&<div className="realWorldError">{arError}</div>}
    {live&&<SpatialOverlay item={live} onClose={()=>setLive(null)}/>} 
  </>
}
