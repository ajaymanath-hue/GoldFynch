import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { publicUrl } from '@/lib/publicUrl'

document.documentElement.style.setProperty(
  '--charlie-brown-pattern',
  `url("${publicUrl('landing/charlie-brown-pattern.png')}")`,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
