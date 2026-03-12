import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Cacher le splash HTML natif dès que React prend le relais
const splash = document.getElementById('splash')
if (splash) splash.style.display = 'none'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
