import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Favorites({ user }) {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      // Si pas connecté, rediriger vers la page de connexion
      navigate('/login')
      return
    }

    loadFavorites()
  }, [user, navigate])

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          distributor_id,
          distributors (
            id,
            name,
            category,
            address,
            latitude,
            longitude,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filtrer les favoris dont le distributeur existe encore
      const validFavorites = data.filter(fav => fav.distributors !== null)
      setFavorites(validFavorites)
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (favoriteId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error

      // Mettre à jour l'état local
      setFavorites(favorites.filter(fav => fav.id !== favoriteId))
    } catch (error) {
      alert('Erreur lors de la suppression du favori')
      console.error(error)
    }
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      pain: '🥖',
      pizza: '🍕',
      burger: '🍔',
      alimentaire: '🧴',
      fleurs: '🌸',
      parapharmacie: '⚕️',
      autres: '•••'
    }
    return emojis[category] || '📍'
  }

  const getCategoryLabel = (category) => {
    const labels = {
      pain: 'Pain',
      pizza: 'Pizza',
      burger: 'Burger',
      alimentaire: 'Alimentaire',
      fleurs: 'Fleurs',
      parapharmacie: 'Parapharmacie',
      autres: 'Autres'
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-accent-gray">Chargement de vos favoris...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary px-4 py-8 pb-24">
      {/* Titre */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Heart size={32} className="text-primary fill-primary" />
        <h1 className="text-3xl font-bold">Mes Favoris</h1>
      </div>

      {/* Message si pas connecté */}
      {!user && (
        <div className="max-w-md mx-auto bg-white rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-4">
            Connectez-vous pour sauvegarder vos distributeurs favoris
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold"
          >
            Se connecter
          </button>
        </div>
      )}

      {/* Liste vide */}
      {user && favorites.length === 0 && (
        <div className="max-w-md mx-auto bg-white rounded-xl p-8 text-center">
          <Heart size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold mb-2">Aucun favori</h2>
          <p className="text-gray-600 mb-6">
            Ajoutez des distributeurs à vos favoris depuis la carte ou la page de détail
          </p>
          <button
            onClick={() => navigate('/map')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold"
          >
            Explorer la carte
          </button>
        </div>
      )}

      {/* Liste des favoris */}
      {user && favorites.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4">
          {favorites.map((favorite) => {
            const dist = favorite.distributors
            return (
              <div
                key={favorite.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  {/* Emoji catégorie */}
                  <div className="text-4xl flex-shrink-0">
                    {getCategoryEmoji(dist.category)}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 truncate">
                      {dist.name || 'Distributeur'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {getCategoryLabel(dist.category)}
                    </p>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{dist.address}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/map?distributor=${dist.id}&lat=${dist.latitude}&lng=${dist.longitude}`)}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                    >
                      Voir
                    </button>
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Retirer
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info bas de page */}
      {user && favorites.length > 0 && (
        <div className="text-center mt-8 text-gray-600 text-sm">
          {favorites.length} favori{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
