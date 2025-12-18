import { createRoot } from 'react-dom/client';
import { Router } from './router';
import './assets/global.css';

createRoot(document.getElementById('root')!).render(<Router />);