import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Cacher le splash HTML natif dès que React prend le relais
const splash = document.getElementById('splash')
if (splash) splash.style.display = 'none'

// Enregistrer le Service Worker Firebase pour les notifications push
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
    .then(reg => console.log('Firebase SW enregistré:', reg.scope))
    .catch(err => console.warn('Firebase SW échec:', err))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
