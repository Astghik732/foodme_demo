import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initSentry } from './lib/sentry.js'
import { startFlakyHeartbeat } from './lib/flakyHeartbeat.js'

initSentry()
startFlakyHeartbeat()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
