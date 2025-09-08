import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log app initialization
console.log('App initializing - checking for existing session...');

createRoot(document.getElementById("root")!).render(<App />);
