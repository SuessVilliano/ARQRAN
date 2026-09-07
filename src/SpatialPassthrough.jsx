import React,{useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import AppV3 from './AppV3.jsx'
import './spatial-passthrough.css'
import './native-ar-restore.css'

function stageType(){
  const stage=document.querySelector('.stageV2')
  if(!stage)return null
  const typeLabel=(stage.querySelector('.stageHeader span')?.textContent||'').toLowerCase()
  if(typeLabel.includes('3d model'))return 'model'
  if(typeLabel.includes('image'))return 'image'
  if(typeLabel.includes('video'))return 'video'
  if(typeLabel.includes('web'))return 'web'
  if(typeLabel.includes('audio'))return 'audio'
  if(typeLabel.includes('text'))return 'text'
  return null
}

function selectedPreview(){
  const stage=document.querySelector('.stageV2')
  if(!stage)return null
  const type=stageType()
  const model=stage.querySelector('model-viewer')
  if(model?.getAttribute('src'))return{type:'model',src:model.getAttribute('src'),node:model}
  if(type==='model')return{type:'model',src:'',node:model||null}
  const image=stage.querySelector('img.spatialMedia')
  if(type==='image')return{type:'image',src:image?.currentSrc||image?.src||''}
  const video=stage.querySelector('video.spatialMedia')
  if(type==='video')return{type:'video',src:video?.currentSrc||video?.src||''}
  const web=stage.querySelector('.webPanel iframe')
  if(type==='web')return{type:'web',src:web?.src||''}
  const audio=stage.querySelector('.audioPanel audio')
  if(type==='audio')return{type:'audio',src:audio?.currentSrc||audio?.src||'',name:stage.querySelector('.audioPanel b')?.textContent||'Audio'}
  const text=stage.querySelector('.textPanel')
  if(type==='text')return{type:'text',text:text?.textContent||'',color:text?getComputedStyle(text).color:'#fff'}
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
  const group=name=>{const label=labels.find(x=>x.textContent.trim().toUpperCase()===name);return label?.nextElementSibling?.querySelectorAll?.('input')||[]}
  const position=group('POSITION'),rotate=group('ROTATION'),size=group('SCALE')
  const x=((pos.x-50)/50*2).toFixed(2),y=((50-pos.y)/50*2+1.4).toFixed(2),currentZ=position[2]?.value||'-2'
  setReactInput(position[0],x);setReactInput(position[1],y);setReactInput(position[2],currentZ)
  setReactInput(rotate[0],rotate[0]?.value||0);setReactInput(rotate[1],rotate[1]?.value||0);setReactInput(rotate[2],rotation)
  setReactInput(size[0],scale);setReactInput(size[1],scale);setReactInput(size[2],scale)
  return true
}

function MediaObject({item}){
  if(!item)return null
  if(item.type==='model'&&item.src)return <model-viewer className="desktopSpatialModel" src={item.src} camera-controls interaction-prompt="none" shadow-intensity="0" exposure="1" environment-image="neutral" camera-orbit="0deg 75deg auto" min-camera-orbit="auto auto 20%" max-camera-orbit="auto auto 300%"/>
  if(item.type==='image'&&item.src)return <img src={item.src} alt="Spatial object"/>
  if(item.type==='video'&&item.src)return <video src={item.src} autoPlay loop muted playsInline/>
  if(item.type==='web'&&item.src)return <iframe src={item.src} title="Spatial web panel"/>
  if(item.type==='text')return <div className="spatialLiveText" style={{color:item.color}}>{item.text||'Text object'}</div>
  if(item.type==='audio'&&item.src)return <div className="spatialLiveAudio"><span>♫</span><b>{item.name}</b><audio src={item.src} controls autoPlay/></div>
  return null
}

function CameraCanvas({item,onClose,inline=false}){
  const videoRef=useRef(null)
  const initialScale=item?.type==='model'?.55:1
  const [error,setError]=useState(''),[scale,setScale]=useState(initialScale),[rotation,setRotation]=useState(0),[pos,setPos]=useState({x:50,y:50}),[saved,setSaved]=useState('')
  const drag=useRef(null),pinch=useRef(null)
  useEffect(()=>{let stream;if(!navigator.mediaDevices?.getUserMedia){setError('Camera access is not supported in this browser.');return}
    navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false}).then(s=>{stream=s;if(videoRef.current){videoRef.current.srcObject=s;videoRef.current.play().catch(()=>{})}}).catch(e=>setError(e.message||'Camera permission is required.'))
    return()=>stream?.getTracks?.().forEach(t=>t.stop())
  },[])
  const start=e=>{if(e.touches?.length===2){const[a,b]=e.touches;pinch.current={distance:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),scale};return}const p=e.touches?.[0]||e;drag.current={x:p.clientX,y:p.clientY,px:pos.x,py:pos.y}}
  const move=e=>{if(e.touches?.length===2&&pinch.current){const[a,b]=e.touches,d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);setScale(Math.max(.05,Math.min(5,pinch.current.scale*(d/pinch.current.distance))));return}if(!drag.current)return;const p=e.touches?.[0]||e,box=(e.currentTarget||document.body).getBoundingClientRect(),dx=(p.clientX-drag.current.x)/Math.max(box.width,1)*100,dy=(p.clientY-drag.current.y)/Math.max(box.height,1)*100;setPos({x:Math.max(3,Math.min(97,drag.current.px+dx)),y:Math.max(5,Math.min(95,drag.current.py+dy))})}
  const end=()=>{drag.current=null;pinch.current=null}
  const save=()=>{const ok=savePlacementToEditor({pos,scale,rotation});setSaved(ok?'Placement copied into the selected object. Tap Save scene to persist it.':'Could not find the object editor.')}
  const missing=!item||(['model','image','video','web','audio'].includes(item.type)&&!item.src)
  return <div className={inline?'desktopLiveCamera':'spatialLive'} onMouseMove={move} onMouseUp={end} onTouchMove={move} onTouchEnd={end}>
    <video ref={videoRef} className="spatialLiveCamera" playsInline muted autoPlay/>
    <div className="spatialLiveHud"><button onClick={onClose}>×</button><div><b>{inline?'LIVE CAMERA PREVIEW':'REAL-WORLD EDIT'}</b><span>Drag • resize • rotate • save</span></div><button onClick={()=>setPos({x:50,y:50})}>Center</button></div>
    {error?<div className="spatialLiveError">{error}</div>:missing?<div className="desktopCameraHint"><b>Camera is live.</b><span>Upload or paste a source for this {item?.type||'object'} and it will appear here.</span></div>:<div className={`spatialLiveObject ${item?.type==='model'?'modelObject':''}`} onMouseDown={start} onTouchStart={start} style={{left:`${pos.x}%`,top:`${pos.y}%`,transform:`translate(-50%,-50%) rotate(${rotation}deg) scale(${scale})`}}><MediaObject item={item}/></div>}
    {saved&&<div className="spatialSaved">{saved}</div>}
    <div className="spatialLiveControls"><button onClick={()=>setScale(v=>Math.max(.05,v-.1))}>−</button><span>{scale.toFixed(2)}×</span><button onClick={()=>setScale(v=>Math.min(5,v+.1))}>＋</button><button onClick={()=>setRotation(v=>v-15)}>↺</button><button onClick={()=>setRotation(v=>v+15)}>↻</button><button onClick={()=>{setScale(initialScale);setRotation(0);setPos({x:50,y:50})}}>Reset</button><button className="savePlacement" onClick={save}>Save Placement</button></div>
  </div>
}

export default function SpatialPassthrough(){
  const [available,setAvailable]=useState(null),[live,setLive]=useState(null),[desktopLive,setDesktopLive]=useState(false),[stage,setStage]=useState(null),[arError,setArError]=useState('')
  useEffect(()=>{const check=()=>{setAvailable(selectedPreview());setStage(document.querySelector('.stageV2'))};check();const o=new MutationObserver(check);o.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src','class']});const id=setInterval(check,400);return()=>{o.disconnect();clearInterval(id)}},[])
  useEffect(()=>{if(innerWidth<901)setDesktopLive(false)},[available?.type])

  async function openRealWorld(){
    const item=selectedPreview();setArError('')
    if(!item){setArError('Select an object first.');return}
    if(!item.src&&item.type!=='text'){setArError(`Upload or paste a source for this ${item.type} first.`);return}
    if(innerWidth>=901){setDesktopLive(true);return}
    if(item.type==='model'){
      try{const viewer=item.node;await viewer.updateComplete;await viewer.activateAR()}catch(e){try{const button=item.node?.querySelector('button[slot="ar-button"]');if(button){button.click();return}}catch{}setArError(e?.message||'Could not start AR for the uploaded GLB.')}
      return
    }
    setLive(item)
  }

  const desktopPortal=desktopLive&&stage&&available?createPortal(<CameraCanvas key={`${available?.type}:${available?.src||available?.text||''}`} item={available} inline onClose={()=>setDesktopLive(false)}/>,stage):null

  return <><AppV3/>{available&&<button className="realWorldFab" onClick={openRealWorld}>{innerWidth>=901?'◉ Live Camera':'◎ Real World'}</button>}{arError&&<div className="realWorldError">{arError}</div>}{live&&<CameraCanvas item={live} onClose={()=>setLive(null)}/>} {desktopPortal}</>
}
