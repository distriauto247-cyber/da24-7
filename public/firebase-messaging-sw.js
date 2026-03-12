// Service Worker pour Firebase Cloud Messaging
// Ce fichier doit être à la RACINE du projet public/ ou dist/

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Configuration Firebase
// ⚠️ REMPLACEZ ces valeurs par celles de VOTRE projet Firebase
firebase.initializeApp({
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
})

const messaging = firebase.messaging()

// Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('Notification reçue en arrière-plan:', payload)
  
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: payload.data,
    vibrate: [200, 100, 200],
    tag: 'da247-notification',
    requireInteraction: false
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Gérer le clic sur la notification
self.addEventListener('notificationclick', (event) => {
  console.log('Notification cliquée:', event)
  
  event.notification.close()
  
  // Ouvrir l'application ou la carte selon le type de notification
  const urlToOpen = event.notification.data?.url || '/map'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si l'app est déjà ouverte, la focus
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            client.navigate(urlToOpen)
            return
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})
