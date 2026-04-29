import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css'
import './styles/tokens.css'
import './index.css'
import App from './App.tsx'

window.addEventListener('error', (e) => {
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: red; color: white; padding: 10px; z-index: 9999; word-break: break-all;';
  errDiv.textContent = 'Error: ' + e.message + ' at ' + e.filename + ':' + e.lineno;
  document.body.appendChild(errDiv);
});

window.addEventListener('unhandledrejection', (e) => {
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position: fixed; top: 50px; left: 0; right: 0; background: orange; color: white; padding: 10px; z-index: 9999; word-break: break-all;';
  errDiv.textContent = 'Promise Error: ' + (e.reason?.message || String(e.reason));
  document.body.appendChild(errDiv);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
