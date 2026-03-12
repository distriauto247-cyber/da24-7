import { useState, useEffect } from 'react'
import { messaging, getToken, onMessage, VAPID_KEY } from '../lib/firebase'
import { supabase } from '../lib/supabase'

export function usePushNotifications(user) {
  const [permission, setPermission] = useState(Notification.permission)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)

  // Demander la permission et enregistrer le token
  const requestPermission = async () => {
    if (!messaging) {
      console.log('Messaging not available')
      return false
    }

    setLoading(true)
    
    try {
      // Demander la permission
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm === 'granted') {
        // Obtenir le token FCM
        const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY })
        
        if (currentToken) {
          console.log('Token FCM obtenu:', currentToken)
          setToken(currentToken)
          
          // Sauvegarder le token dans Supabase
          if (user) {
            await saveTokenToDatabase(currentToken, user.id)
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
      console.log('Token sauvegardé dans Supabase')
    } catch (error) {
      console.error('Erreur sauvegarde token:', error)
    }
  }

  // Écouter les messages en premier plan (quand l'app est ouverte)
  useEffect(() => {
    if (!messaging) return

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message reçu en premier plan:', payload)
      
      // Afficher une notification même si l'app est ouverte
      if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/icons/icon-192x192.png',
          data: payload.data
        })
      }
    })

    return () => unsubscribe()
  }, [])

  // Vérifier si le token existe déjà au chargement
  useEffect(() => {
    if (!messaging || !user) return

    const checkExistingToken = async () => {
      try {
        const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY })
        if (currentToken) {
          setToken(currentToken)
          await saveTokenToDatabase(currentToken, user.id)
        }
      } catch (error) {
        console.log('Token non disponible:', error)
      }
    }

    if (Notification.permission === 'granted') {
      checkExistingToken()
    }
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
