import { useState, useEffect } from 'react'
import { messaging, getToken, onMessage, VAPID_KEY } from '../lib/firebase'
import { supabase } from '../lib/supabase'

export function usePushNotifications(user) {
  const [permission, setPermission] = useState(Notification.permission)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)

  // Obtenir le Service Worker Firebase enregistré
  const getFirebaseSW = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      const firebaseSW = registrations.find(r => 
        r.active?.scriptURL?.includes('firebase-messaging-sw.js')
      )
      if (firebaseSW) return firebaseSW
      // Si pas encore enregistré, l'enregistrer maintenant
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
      await navigator.serviceWorker.ready
      return reg
    } catch (err) {
      console.warn('Erreur SW Firebase:', err)
      return null
    }
  }

  // Sauvegarder le token dans Supabase
  const saveTokenToDatabase = async (fcmToken, userId) => {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: userId,
          token: fcmToken,
          endpoint: 'fcm',
          last_used: new Date().toISOString()
        }, {
          onConflict: 'user_id,token'
        })

      if (error) throw error
      console.log('✅ Token sauvegardé dans Supabase')
    } catch (error) {
      console.error('❌ Erreur sauvegarde token:', error)
    }
  }

  // Demander la permission et enregistrer le token
  const requestPermission = async () => {
    if (!messaging) {
      console.log('Messaging not available')
      return false
    }

    setLoading(true)
    
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm === 'granted') {
        // Obtenir le SW Firebase
        const swRegistration = await getFirebaseSW()

        // Obtenir le token FCM en passant le SW
        const currentToken = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swRegistration || undefined
        })
        
        if (currentToken) {
          console.log('✅ Token FCM obtenu:', currentToken)
          setToken(currentToken)
          
          if (user) {
            await saveTokenToDatabase(currentToken, user.id)
          } else {
            // Stocker temporairement pour sauvegarder quand user se connecte
            localStorage.setItem('pendingFCMToken', currentToken)
          }
          
          return true
        } else {
          console.log('Pas de token disponible')
          return false
        }
      } else {
        console.log('Permission refusée')
        return false
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Écouter les messages en premier plan
  useEffect(() => {
    if (!messaging) return

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message reçu en premier plan:', payload)
      
      if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/logo-192.png',
          data: payload.data
        })
      }
    })

    return () => unsubscribe()
  }, [])

  // Vérifier/enregistrer le token quand user est disponible
  useEffect(() => {
    if (!messaging || !user) return

    const checkExistingToken = async () => {
      try {
        // Vérifier si un token en attente existe
        const pendingToken = localStorage.getItem('pendingFCMToken')
        if (pendingToken) {
          await saveTokenToDatabase(pendingToken, user.id)
          localStorage.removeItem('pendingFCMToken')
          setToken(pendingToken)
          return
        }

        if (Notification.permission !== 'granted') return

        const swRegistration = await getFirebaseSW()
        const currentToken = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swRegistration || undefined
        })
        
        if (currentToken) {
          setToken(currentToken)
          await saveTokenToDatabase(currentToken, user.id)
        }
      } catch (error) {
        console.log('Token non disponible:', error)
      }
    }

    checkExistingToken()
  }, [user])

  return {
    permission,
    token,
    loading,
    requestPermission,
    isSupported: !!messaging,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied'
  }
}
