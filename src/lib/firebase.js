import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// Configuration Firebase
// ⚠️ REMPLACEZ ces valeurs par celles de VOTRE projet Firebase
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
}

// Clé VAPID publique
// ⚠️ REMPLACEZ par votre clé VAPID générée dans Firebase Console
export const VAPID_KEY = "VOTRE_CLE_VAPID_PUBLIQUE"

// Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Initialiser Cloud Messaging
let messaging = null
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app)
  }
} catch (error) {
  console.log('Messaging not supported:', error)
}

export { messaging, getToken, onMessage }
