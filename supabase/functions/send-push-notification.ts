// Supabase Edge Function: send-push-notification
// Déploiement: supabase functions deploy send-push-notification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY') // À ajouter dans Supabase secrets

serve(async (req) => {
  try {
    const { distributorId, action } = await req.json()

    // Créer client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer les infos du distributeur
    const { data: distributor, error: distError } = await supabaseClient
      .from('distributors')
      .select('*')
      .eq('id', distributorId)
      .single()

    if (distError || !distributor) {
      throw new Error('Distributeur non trouvé')
    }

    // Récupérer les utilisateurs à notifier
    const { data: users, error: usersError } = await supabaseClient
      .from('user_preferences')
      .select('user_id, watched_cities, favorite_categories, notifications')

    if (usersError) throw usersError

    // Filtrer les utilisateurs concernés
    const usersToNotify = users?.filter(user => {
      const prefs = user.notifications || {}
      const watchedCities = user.watched_cities || []
      const favoriteCategories = user.favorite_categories || []

      // Vérifier si l'utilisateur a activé les notifications
      if (!prefs.newMachinesInCities && !prefs.favoriteCategories) {
        return false
      }

      // Vérifier si la ville du distributeur est surveillée
      const cityMatch = watchedCities.some(city => 
        distributor.city?.toLowerCase().includes(city.toLowerCase())
      )

      // Vérifier si la catégorie est favorite
      const categoryMatch = favoriteCategories.includes(distributor.category)

      return cityMatch || categoryMatch
    }) || []

    // Récupérer les tokens push des utilisateurs concernés
    const userIds = usersToNotify.map(u => u.user_id)
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('push_tokens')
      .select('token, user_id')
      .in('user_id', userIds)

    if (tokensError) throw tokensError

    // Préparer le message
    const notification = {
      title: '🆕 Nouveau distributeur',
      body: `${distributor.category} à ${distributor.city || 'votre ville'}`,
      icon: '/icons/icon-192x192.png',
      data: {
        url: `/map?distributor=${distributorId}&lat=${distributor.latitude}&lng=${distributor.longitude}`,
        distributorId: distributorId
      }
    }

    // Envoyer les notifications via FCM
    const results = await Promise.all(
      tokens?.map(async ({ token }) => {
        try {
          const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `key=${FIREBASE_SERVER_KEY}`
            },
            body: JSON.stringify({
              to: token,
              notification: notification,
              data: notification.data
            })
          })

          return await response.json()
        } catch (error) {
          console.error('Erreur envoi notification:', error)
          return { error: error.message }
        }
      }) || []
    )

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent: results.length,
        results 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
