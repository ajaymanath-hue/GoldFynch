import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'font-awesome/css/font-awesome.min.css'
import '@fortawesome/fontawesome-free/css/fontawesome.min.css'
import '@fortawesome/fontawesome-free/css/solid.min.css'
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
