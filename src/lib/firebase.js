import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// Configuration Firebase
// ⚠️ REMPLACEZ ces valeurs par celles de VOTRE projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAoXef72npApy08Pv5By2Z-pq18x8vfgnc",
  authDomain: "da24-7.firebaseapp.com",
  projectId: "da24-7",
  storageBucket: "da24-7.firebasestorage.app",
  messagingSenderId: "55237039614",
  appId: "1:55237039614:web:5c01d1f29142e4af631caf"
}

// Clé VAPID publique
// ⚠️ REMPLACEZ par votre clé VAPID générée dans Firebase Console
export const VAPID_KEY = "BGbCHCP5cy5_RY37Aib7kPCsDGTtsNaJiyRqTplK6SLQwI_NcK0EHto7P1zHVZ2RgxLzJ42Qr_HkVwt0_REXYGA"

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
