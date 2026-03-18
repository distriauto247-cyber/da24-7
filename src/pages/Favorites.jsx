import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, Trash2, Filter } from 'lucide-react'
import iconPain from '../assets/icons/pain.png'
import iconPizza from '../assets/icons/pizza.png'
import iconBurger from '../assets/icons/burger.png'
import iconAlimentaire from '../assets/icons/alimentaire.png'
import iconFleurs from '../assets/icons/fleurs.png'
import iconParapharmacie from '../assets/icons/parapharmacie.png'
import iconAutres from '../assets/icons/autres.png'
import { supabase } from '../lib/supabase'

export default function Favorites({ user }) {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('machines')
  const [mapCategoryFilter, setMapCategoryFilter] = useState([])

  const CATEGORIES = [
    { value: 'pain', label: 'Pain', icon: iconPain },
    { value: 'pizza', label: 'Pizza', icon: iconPizza },
    { value: 'burger', label: 'Burger', icon: iconBurger },
    { value: 'alimentaire', label: 'Alimentaire', icon: iconAlimentaire },
    { value: 'fleurs', label: 'Fleurs', icon: iconFleurs },
    { value: 'parapharmacie', label: 'Pharma', icon: iconParapharmacie },
    { value: 'autres', label: 'Autres', icon: iconAutres },
  ]

  useEffect(() => {
    if (!user) {
      // Si pas connecté, rediriger vers la page de connexion
      navigate('/login')
      return
    }

    loadFavorites()
    const saved = localStorage.getItem('mapCategoryFilter')
    if (saved) setMapCategoryFilter(JSON.parse(saved))
  }, [user, navigate])

  const handleToggleMapCategory = (categoryValue) => {
    setMapCategoryFilter(prev => {
      const newFilter = prev.includes(categoryValue)
        ? prev.filter(c => c !== categoryValue)
        : [...prev, categoryValue]
      localStorage.setItem('mapCategoryFilter', JSON.stringify(newFilter))
      return newFilter
    })
  }

  const handleClearMapFilter = () => {
    setMapCategoryFilter([])
    localStorage.removeItem('mapCategoryFilter')
  }

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
      {/* Titre + onglets */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart size={28} className="text-primary fill-primary" />
          <h1 className="text-2xl font-bold">Mes Favoris</h1>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('machines')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'machines' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            🤖 Machines ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'categories' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            🗺️ Filtre carte {mapCategoryFilter.length > 0 ? `(${mapCategoryFilter.length})` : ''}
          </button>
        </div>
      </div>

      {activeTab === 'machines' && (<>
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

      {/* Onglet Filtre Carte */}
      {activeTab === 'categories' && (
        <div className="max-w-md mx-auto">
          <p className="text-sm text-gray-500 mb-4 text-center">
            Cochez les catégories à afficher sur la carte. Si aucune n'est cochée, toutes s'affichent.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleToggleMapCategory(cat.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition ${
                  mapCategoryFilter.includes(cat.value)
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <img src={cat.icon} alt={cat.label} className="w-8 h-8 object-contain" />
                <span className={`text-sm font-bold ${mapCategoryFilter.includes(cat.value) ? 'text-primary' : 'text-gray-700'}`}>
                  {cat.label}
                </span>
                {mapCategoryFilter.includes(cat.value) && (
                  <span className="ml-auto text-primary font-bold">✓</span>
                )}
              </button>
            ))}
          </div>

          {mapCategoryFilter.length > 0 ? (
            <div className="text-center">
              <p className="text-xs text-primary font-medium mb-2">
                {mapCategoryFilter.length} catégorie{mapCategoryFilter.length > 1 ? 's' : ''} filtrée{mapCategoryFilter.length > 1 ? 's' : ''} sur la carte
              </p>
              <button onClick={handleClearMapFilter} className="text-xs text-gray-400 underline">
                Tout afficher (réinitialiser)
              </button>
            </div>
          ) : (
            <p className="text-xs text-green-600 text-center">✅ Toutes les catégories affichées</p>
          )}
        </div>
      )}

      </> )}

      {/* Info bas de page */}
      {user && favorites.length > 0 && activeTab === 'machines' && (
        <div className="text-center mt-8 text-gray-600 text-sm">
          {favorites.length} favori{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
