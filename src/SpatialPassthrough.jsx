import React,{useEffect,useRef,useState} from 'react'
import AppV2 from './AppV2.jsx'
import './spatial-passthrough.css'

function selectedPreview(){
  const stage=document.querySelector('.stageV2')
  if(!stage)return null
  const model=stage.querySelector('model-viewer')
  if(model)return{type:'model',node:model}
  const image=stage.querySelector('img.spatialMedia')
  if(image)return{type:'image',src:image.currentSrc||image.src}
  const video=stage.querySelector('video.spatialMedia')
  if(video)return{type:'video',src:video.currentSrc||video.src}
  const web=stage.querySelector('.webPanel iframe')
  if(web)return{type:'web',src:web.src}
  const text=stage.querySelector('.textPanel')
  if(text)return{type:'text',text:text.textContent,color:getComputedStyle(text).color}
  const audio=stage.querySelector('.audioPanel audio')
  if(audio)return{type:'audio',src:audio.currentSrc||audio.src,name:stage.querySelector('.audioPanel b')?.textContent||'Audio'}
  return null
}

function SpatialOverlay({item,onClose}){
  const videoRef=useRef(null),[error,setError]=useState(''),[scale,setScale]=useState(1),[rotation,setRotation]=useState(0),[pos,setPos]=useState({x:50,y:50}),drag=useRef(null)
  useEffect(()=>{let stream;navigator.mediaDevices?.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}).then(s=>{stream=s;if(videoRef.current){videoRef.current.srcObject=s;videoRef.current.play()}}).catch(e=>setError(e.message||'Camera permission is required.'));return()=>stream?.getTracks?.().forEach(t=>t.stop())},[])
  const start=e=>{const p=e.touches?.[0]||e;drag.current={x:p.clientX,y:p.clientY,px:pos.x,py:pos.y}}
  const move=e=>{if(!drag.current)return;const p=e.touches?.[0]||e;const dx=(p.clientX-drag.current.x)/innerWidth*100,dy=(p.clientY-drag.current.y)/innerHeight*100;setPos({x:Math.max(5,Math.min(95,drag.current.px+dx)),y:Math.max(8,Math.min(92,drag.current.py+dy))})}
  const end=()=>drag.current=null
  return <div className="spatialLive" onMouseMove={move} onMouseUp={end} onTouchMove={move} onTouchEnd={end}>
    <video ref={videoRef} className="spatialLiveCamera" playsInline muted/>
    <div className="spatialLiveHud"><button onClick={onClose}>×</button><div><b>REAL-WORLD PREVIEW</b><span>Drag • resize • rotate</span></div><button onClick={()=>setPos({x:50,y:50})}>Center</button></div>
    {error?<div className="spatialLiveError">{error}</div>:<div className="spatialLiveObject" onMouseDown={start} onTouchStart={start} style={{left:`${pos.x}%`,top:`${pos.y}%`,transform:`translate(-50%,-50%) rotate(${rotation}deg) scale(${scale})`}}>
      {item.type==='image'&&<img src={item.src} alt="Spatial object"/>}
      {item.type==='video'&&<video src={item.src} autoPlay loop muted playsInline/>}
      {item.type==='web'&&<iframe src={item.src} title="Spatial web panel"/>}
      {item.type==='text'&&<div className="spatialLiveText" style={{color:item.color}}>{item.text}</div>}
      {item.type==='audio'&&<div className="spatialLiveAudio"><span>♫</span><b>{item.name}</b><audio src={item.src} controls autoPlay/></div>}
    </div>}
    <div className="spatialLiveControls"><button onClick={()=>setScale(v=>Math.max(.25,v-.2))}>−</button><span>Size {scale.toFixed(1)}×</span><button onClick={()=>setScale(v=>Math.min(4,v+.2))}>＋</button><button onClick={()=>setRotation(v=>v-15)}>↺</button><button onClick={()=>setRotation(v=>v+15)}>↻</button></div>
  </div>
}

export default function SpatialPassthrough(){
  const [available,setAvailable]=useState(null),[live,setLive]=useState(null)
  useEffect(()=>{const check=()=>setAvailable(selectedPreview());check();const o=new MutationObserver(check);o.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src','class']});const id=setInterval(check,1200);return()=>{o.disconnect();clearInterval(id)}},[])
  function open(){const item=selectedPreview();if(!item)return;if(item.type==='model'){const btn=item.node.querySelector('button[slot="ar-button"]');if(btn)btn.click();else item.node.activateAR?.();return}setLive(item)}
  return <><AppV2/>{available&&<button className="realWorldFab" onClick={open}>◎ Real World</button>}{live&&<SpatialOverlay item={live} onClose={()=>setLive(null)}/>}</>
}
