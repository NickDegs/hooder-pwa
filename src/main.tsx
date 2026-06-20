import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initFps } from './services/fps'

// Yenileme hızı: cihaz azamisini ölç (120 ProMotion / 60) + kayıtlı tercihi uygula
initFps()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
