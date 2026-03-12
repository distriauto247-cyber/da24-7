import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Camera, Star, Snowflake, Flame, Check, X, Share2, 
  MapPin, Clock, CreditCard, Phone, Navigation, Heart, AlertTriangle,
  ChevronDown, ChevronUp, Edit, ExternalLink
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { 
  getDistributorById, 
  addFavorite, 
  removeFavorite, 
  isFavorite as checkIsFavorite,
  calculateHaversineDistance 
} from '../lib/distributorService'
import Button from '../components/Button'

// Configuration des catégories
const categoryConfig = {
  pain: { emoji: '🥖', label: 'Boulangerie', color: '#D4A574' },
  pizza: { emoji: '🍕', label: 'Pizza', color: '#E74C3C' },
  burger: { emoji: '🍔', label: 'Burger', color: '#F39C12' },
  alimentaire: { emoji: '🛒', label: 'Alimentaire', color: '#27AE60' },
  fleurs: { emoji: '💐', label: 'Fleurs', color: '#E91E63' },
  parapharmacie: { emoji: '💊', label: 'Parapharmacie', color: '#3498DB' },
  autres: { emoji: '🏪', label: 'Autres', color: '#9B59B6' },
}

export default function DistributorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // États
  const [distributor, setDistributor] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // UI States
  const [showProducts, setShowProducts] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [userPosition, setUserPosition] = useState(null)
  const [distance, setDistance] = useState(null)
  
  // User
  const [user, setUser] = useState(null)

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  useEffect(() => {
    loadDistributor()
    loadProducts()
    loadUser()
    getUserLocation()
  }, [id])

  // Vérifier le statut favori quand user et distributor sont chargés
  useEffect(() => {
    if (user && distributor) {
      checkFavoriteStatus()
    }
  }, [user, distributor])

  // Calculer la distance quand on a la position
  useEffect(() => {
    if (userPosition && distributor?.latitude && distributor?.longitude) {
      const dist = calculateHaversineDistance(
        userPosition[0], userPosition[1],
        distributor.latitude, distributor.longitude
      )
      setDistance(dist)
    }
  }, [userPosition, distributor])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const loadDistributor = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await getDistributorById(id)
      
      if (error) throw error
      if (!data) throw new Error('Distributeur non trouvé')
      
      setDistributor(data)
    } catch (err) {
      console.error('Erreur chargement distributeur:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('distributor_id', id)
        .order('name')

      if (!error) {
        setProducts(data || [])
      }
    } catch (err) {
      console.error('Erreur chargement produits:', err)
    }
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => {} // Ignorer les erreurs silencieusement
      )
    }
  }

  const checkFavoriteStatus = async () => {
    if (!user || !distributor) return
    
    const { isFavorite: status } = await checkIsFavorite(user.id, distributor.id)
    setIsFavorite(status)
  }

  // ============================================
  // ACTIONS
  // ============================================

  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setFavoriteLoading(true)
    
    try {
      if (isFavorite) {
        await removeFavorite(user.id, distributor.id)
        setIsFavorite(false)
      } else {
        await addFavorite(user.id, distributor.id)
        setIsFavorite(true)
      }
    } catch (err) {
      console.error('Erreur favori:', err)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: distributor?.name,
      text: `Découvrez ce distributeur sur DA24.7 : ${distributor?.name}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback : copier le lien
          copyToClipboard(window.location.href)
        }
      }
    } else {
      copyToClipboard(window.location.href)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Lien copié !')
  }

  const handleItinerary = () => {
    if (distributor?.latitude && distributor?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${distributor.latitude},${distributor.longitude}`
      window.open(url, '_blank')
    }
  }

  const handleCall = () => {
    if (distributor?.contact) {
      // Extraire le numéro de téléphone si présent
      const phoneMatch = distributor.contact.match(/(\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/)
      if (phoneMatch) {
        window.location.href = `tel:${phoneMatch[1].replace(/[\s.]/g, '')}`
      }
    }
  }

  const handleAddPhoto = () => {
    // TODO: Implémenter l'upload de photo
    alert('Fonctionnalité d\'ajout de photo à venir')
  }

  const handleReport = () => {
    navigate(`/report-problem/${id}`)
  }

  // ============================================
  // RENDU CONDITIONNEL
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-accent-gray">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !distributor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary px-6">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Distributeur introuvable</h2>
        <p className="text-gray-500 text-center mb-6">{error || 'Ce distributeur n\'existe pas ou a été supprimé.'}</p>
        <Button onClick={() => navigate(-1)}>Retour</Button>
      </div>
    )
  }

  const category = categoryConfig[distributor.category] || categoryConfig.autres

  // ============================================
  // RENDU PRINCIPAL
  // ============================================

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* ============================================ */}
      {/* IMAGE HEADER */}
      {/* ============================================ */}
      <div className="relative h-56 bg-gray-200">
        {distributor.photo_url ? (
          <img
            src={distributor.photo_url}
            alt={distributor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: category.color + '20' }}
          >
            <span className="text-8xl">{category.emoji}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>

        {/* Actions header */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleShare}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
          >
            <Share2 size={20} className="text-gray-700" />
          </button>
          <button
            onClick={handleReport}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
          >
            <AlertTriangle size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Bouton ajouter photo */}
        <button
          onClick={handleAddPhoto}
          className="absolute bottom-4 left-4 bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg text-sm font-medium"
        >
          <Camera size={18} />
          Ajouter une photo
        </button>

        {/* Badge catégorie */}
        <div 
          className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg"
          style={{ backgroundColor: category.color }}
        >
          <span className="text-lg">{category.emoji}</span>
          <span className="text-white text-sm font-medium">{category.label}</span>
        </div>
      </div>

      {/* ============================================ */}
      {/* CONTENU PRINCIPAL */}
      {/* ============================================ */}
      <div className="px-4 py-4 space-y-4">
        
        {/* Nom et note */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{distributor.name}</h1>
            
            {/* Rating */}
            {distributor.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(distributor.rating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                    }
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">
                  {distributor.rating.toFixed(1)}
                  {distributor.rating_count > 0 && ` (${distributor.rating_count} avis)`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Adresse et distance */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-700">{distributor.address}</p>
              {distributor.city && (
                <p className="text-gray-500">{distributor.postal_code} {distributor.city}</p>
              )}
              {distance && (
                <p className="text-primary font-medium text-sm mt-1">
                  À {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Horaires */}
        {distributor.hours && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Horaires</p>
                <p className="text-gray-600">{distributor.hours}</p>
              </div>
            </div>
          </div>
        )}

        {/* Moyens de paiement */}
        {distributor.payment_methods && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <CreditCard size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Paiement accepté</p>
                <p className="text-gray-600">{distributor.payment_methods}</p>
              </div>
            </div>
          </div>
        )}

        {/* Caractéristiques */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="font-medium text-gray-700 mb-3">Caractéristiques</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Froid/Chaud */}
            <div className="flex items-center gap-2">
              {distributor.is_cold ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Snowflake size={18} className="text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-600">Produits frais</span>
                </>
              ) : distributor.is_cold === false ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Flame size={18} className="text-orange-500" />
                  </div>
                  <span className="text-sm text-gray-600">Produits chauds</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">?</span>
                  </div>
                  <span className="text-sm text-gray-400">Non renseigné</span>
                </>
              )}
            </div>

            {/* Parking */}
            <div className="flex items-center gap-2">
              {distributor.has_parking ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check size={18} className="text-green-500" />
                  </div>
                  <span className="text-sm text-gray-600">Parking proche</span>
                </>
              ) : distributor.has_parking === false ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <X size={18} className="text-red-500" />
                  </div>
                  <span className="text-sm text-gray-600">Pas de parking</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">?</span>
                  </div>
                  <span className="text-sm text-gray-400">Non renseigné</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Produits disponibles */}
        <button
          onClick={() => setShowProducts(!showProducts)}
          className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🛒</span>
            <span className="font-medium text-gray-700">Produits disponibles</span>
            {products.length > 0 && (
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {products.length}
              </span>
            )}
          </div>
          {showProducts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showProducts && (
          <div className="bg-white rounded-xl p-4 shadow-sm -mt-2">
            {products.length > 0 ? (
              <ul className="space-y-2">
                {products.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xl">{product.icon || '📦'}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">{product.name}</p>
                      {product.price && (
                        <p className="text-sm text-primary">{product.price.toFixed(2)} €</p>
                      )}
                    </div>
                    {product.available === false && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Indisponible</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun produit renseigné</p>
            )}
            <p className="text-xs text-gray-400 text-center mt-3">
              Liste indicative — les produits peuvent varier selon le réassort
            </p>
          </div>
        )}

        {/* Description */}
        {distributor.description && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="font-medium text-gray-700 mb-2">Description</p>
            <p className={`text-gray-600 ${!showFullDescription && 'line-clamp-3'}`}>
              {distributor.description}
            </p>
            {distributor.description.length > 150 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-primary text-sm font-medium mt-2"
              >
                {showFullDescription ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        )}

        {/* Commerçant */}
        {distributor.owner_name && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Commerçant</p>
                <p className="text-gray-600">{distributor.owner_name}</p>
              </div>
              <button
                onClick={() => navigate(`/owner-distributors?owner=${distributor.owner_id}`)}
                className="text-primary text-sm font-medium flex items-center gap-1"
              >
                Voir ses machines
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Contact */}
        {distributor.contact && (
          <button
            onClick={handleCall}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"
          >
            <Phone size={20} className="text-primary" />
            <div className="text-left">
              <p className="font-medium text-gray-700">Contact</p>
              <p className="text-gray-600">{distributor.contact}</p>
            </div>
          </button>
        )}

        {/* Source */}
        {distributor.source === 'sirene' && (
          <p className="text-xs text-gray-400 text-center">
            Données issues du répertoire Sirene • 
            <button onClick={handleReport} className="text-primary ml-1">Signaler une erreur</button>
          </p>
        )}
      </div>

      {/* ============================================ */}
      {/* BARRE D'ACTIONS FIXE */}
      {/* ============================================ */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50">
        <button
          onClick={handleItinerary}
          className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Navigation size={20} />
          ITINÉRAIRE
        </button>
        
        <button
          onClick={handleFavoriteToggle}
          disabled={favoriteLoading}
          className={`px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-colors ${
            isFavorite 
              ? 'bg-primary text-white border-primary' 
              : 'bg-white text-primary border-primary'
          }`}
        >
          <Heart size={20} className={isFavorite ? 'fill-white' : ''} />
          {favoriteLoading ? '...' : (isFavorite ? 'FAVORI' : 'AJOUTER')}
        </button>
      </div>
    </div>
  )
}
