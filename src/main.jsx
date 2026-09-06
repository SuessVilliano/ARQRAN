import React from 'react'
import {createRoot} from 'react-dom/client'
import App from './AppV2.jsx'
import {installPlatformBridge,emitPlatformEvent} from './platform-bridge.js'

installPlatformBridge()

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))
}

window.addEventListener('appinstalled',()=>emitPlatformEvent('pwa_install',{displayMode:matchMedia('(display-mode: standalone)').matches?'standalone':'browser'}))

createRoot(document.getElementById('root')).render(<App/>)
