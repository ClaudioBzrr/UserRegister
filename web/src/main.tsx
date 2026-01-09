import { createRoot } from 'react-dom/client'
import { Router } from './router'
import './assets/styles/global.css'

createRoot(document.getElementById('root')!).render(<Router />)