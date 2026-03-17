import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { Search, Navigation, X, MapPin, Heart, Share2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../lib/supabase'
import L from 'leaflet'

// Import des icônes PNG
import iconPain from '../assets/icons/pain.png'
import iconPizza from '../assets/icons/pizza.png'
import iconBurger from '../assets/icons/burger.png'
import iconAlimentaire from '../assets/icons/alimentaire.png'
import iconFleurs from '../assets/icons/fleurs.png'
import iconParapharmacie from '../assets/icons/parapharmacie.png'
import iconAutres from '../assets/icons/autres.png'

// ============================================
// CONFIGURATION DES ICÔNES PAR CATÉGORIE
// ============================================

const categoryIcons = {
  pain: { icon: iconPain, color: '#D4A574' },
  pizza: { icon: iconPizza, color: '#E74C3C' },
  burger: { icon: iconBurger, color: '#F39C12' },
  alimentaire: { icon: iconAlimentaire, color: '#27AE60' },
  fleurs: { icon: iconFleurs, color: '#E91E63' },
  parapharmacie: { icon: iconParapharmacie, color: '#3498DB' },
  autres: { icon: iconAutres, color: '#9B59B6' },
  default: { icon: iconAutres, color: '#E53935' },
}

// Créer une icône Leaflet personnalisée avec image PNG
const createCategoryIcon = (category) => {
  const config = categoryIcons[category] || categoryIcons.default
  
  return L.divIcon({
    html: `
      <div style="
        background-color: white;
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid ${config.color};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <img src="${config.icon}" style="
          transform: rotate(45deg); 
          width: 24px; 
          height: 24px;
          object-fit: contain;
        " />
      </div>
    `,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

// Icône pour la position utilisateur
const userLocationIcon = L.divIcon({
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background-color: #4285F4;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 8px rgba(66, 133, 244, 0.3);
    "></div>
  `,
  className: 'user-location-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

// Fix pour les icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ============================================
// COMPOSANTS INTERNES
// ============================================

// Composant pour gérer les événements de la carte
function MapController({ position, onMapMove }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, { duration: 1 })
    }
  }, [position, map])

  useMapEvents({
    moveend: () => {
      const center = map.getCenter()
      const bounds = map.getBounds()
      onMapMove([center.lat, center.lng], bounds)
    },
    zoomend: () => {
      const center = map.getCenter()
      const bounds = map.getBounds()
      onMapMove([center.lat, center.lng], bounds)
    },
  })

  return null
}

// Marqueur de position utilisateur
function UserLocationMarker({ position }) {
  return position ? (
    <Marker position={position} icon={userLocationIcon}>
      <Popup>
        <div className="text-center font-medium">Vous êtes ici</div>
      </Popup>
    </Marker>
  ) : null
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function MapView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // États
  const [userPosition, setUserPosition] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [distributors, setDistributors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  
  // Recherche et filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null)
  const [radius, setRadius] = useState(() => {
    const savedDistance = localStorage.getItem('searchDistance')
    return savedDistance ? parseInt(savedDistance) : 10
  }) // km
  const [showFilters, setShowFilters] = useState(false)
  
  // Bottom sheet
  const [selectedDistributor, setSelectedDistributor] = useState(null)
  const [showCategoryCorrection, setShowCategoryCorrection] = useState(false)
  const [categoryCorrectSuccess, setCategoryCorrectSuccess] = useState(false)
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [displayDistance, setDisplayDistance] = useState(null)

  // Catégories disponibles
  const categories = [
    { value: null, label: 'Toutes', icon: iconAutres },
    { value: 'pain', label: 'Pain', icon: iconPain },
    { value: 'pizza', label: 'Pizza', icon: iconPizza },
    { value: 'burger', label: 'Burger', icon: iconBurger },
    { value: 'alimentaire', label: 'Alimentaire', icon: iconAlimentaire },
    { value: 'fleurs', label: 'Fleurs', icon: iconFleurs },
    { value: 'parapharmacie', label: 'Pharma', icon: iconParapharmacie },
    { value: 'autres', label: 'Autres', icon: iconAutres },
  ]

  // ============================================
  // GÉOLOCALISATION
  // ============================================

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée")
      // Ne pas définir de position par défaut si pas de géolocalisation
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude]
        console.log('Position GPS obtenue:', coords, 'Précision:', pos.coords.accuracy, 'm')
        setUserPosition(coords)
        // Ne pas changer mapCenter, il est déjà défini
        setError(null)
      },
      (err) => {
        console.error('Erreur géolocalisation:', err)
        setError("Impossible d'obtenir votre position")
        // Ne pas définir de position par défaut en cas d'erreur
        setUserPosition(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // TOUJOURS obtenir une position fraîche
      }
    )
  }, []) // Retirer mapCenter des dépendances

  // ============================================
  // CHARGEMENT DES DISTRIBUTEURS
  // ============================================

  const loadNearbyDistributors = useCallback(async (lat, lng, category = null, radiusKm = 10) => {
    if (!lat || !lng) return

    setLoading(true)
    
    try {
      // Utiliser la fonction RPC get_nearby_distributors
      const { data, error } = await supabase.rpc('get_nearby_distributors', {
        user_lat: lat,
        user_lng: lng,
        radius_km: radiusKm,
        category_filter: category,
        limit_count: 100,
      })

      if (error) {
        // Fallback si la fonction n'existe pas encore
        console.warn('Fonction RPC non disponible, fallback sur requête directe:', error.message)
        await loadDistributorsFallback(lat, lng, category, radiusKm)
        return
      }

      setDistributors(data || [])
      setError(null)
    } catch (err) {
      console.error('Erreur chargement distributeurs:', err)
      await loadDistributorsFallback(lat, lng, category, radiusKm)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fallback si la fonction RPC n'existe pas
  const loadDistributorsFallback = async (lat, lng, category, radiusKm) => {
    try {
      const latDelta = radiusKm / 111
      const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))

      // ── 1. Charger depuis la table "distributors" (données manuelles) ──
      let queryManuel = supabase
        .from('distributors')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('latitude', lat - latDelta)
        .lte('latitude', lat + latDelta)
        .gte('longitude', lng - lngDelta)
        .lte('longitude', lng + lngDelta)
        .limit(100)

      if (category) {
        queryManuel = queryManuel.eq('category', category)
      }

      // ── 2. Charger depuis la table "distributeurs" (données OSM) ──
      let queryOSM = supabase
        .from('distributeurs')
        .select('osm_id, latitude, longitude, nom, type_produit, operateur, adresse, ville, ouverture, paiement_cb, paiement_especes')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('latitude', lat - latDelta)
        .lte('latitude', lat + latDelta)
        .gte('longitude', lng - lngDelta)
        .lte('longitude', lng + lngDelta)
        .limit(200)

      const [resManuel, resOSM] = await Promise.all([queryManuel, queryOSM])

      if (resManuel.error) console.warn('Erreur table distributors:', resManuel.error.message)
      if (resOSM.error) console.warn('Erreur table distributeurs OSM:', resOSM.error.message)

      // Normaliser les données OSM et filtrer par catégorie si nécessaire
      const osmRaw = (resOSM.data || []).map(d => ({
        id: `osm-${d.osm_id}`,
        name: d.nom || 'Distributeur automatique',
        address: [d.adresse, d.ville].filter(Boolean).join(', ') || 'Adresse inconnue',
        latitude: d.latitude,
        longitude: d.longitude,
        category: mapOSMTypeToCategory(d.type_produit),
        opening_hours: d.ouverture,
        description: [
          d.operateur ? `Opérateur : ${d.operateur}` : null,
          d.paiement_cb ? '💳 CB acceptée' : null,
          d.paiement_especes ? '💶 Espèces acceptées' : null,
        ].filter(Boolean).join(' · '),
        source: 'osm',
      }))

      // Filtrer les données OSM par catégorie si un filtre est actif
      const osmNormalized = category
        ? osmRaw.filter(d => d.category === category)
        : osmRaw

      // Fusionner les deux sources et trier par distance
      const allDistributors = [
        ...(resManuel.data || []),
        ...osmNormalized,
      ]

      const withDistance = allDistributors.map(d => ({
        ...d,
        distance_km: calculateDistance(lat, lng, d.latitude, d.longitude),
      })).sort((a, b) => a.distance_km - b.distance_km)

      setDistributors(withDistance)
      setError(null)
    } catch (err) {
      console.error('Erreur fallback:', err)
      setError('Erreur de chargement')
      setDistributors([])
    }
  }

  // Convertir le type OSM vers les catégories de l'app
  const mapOSMTypeToCategory = (typeOSM) => {
    if (!typeOSM) return 'autres'
    const t = typeOSM.toLowerCase()
    // Pain / boulangerie
    if (t.includes('bread') || t.includes('baguette') || t.includes('pain') || t.includes('bakery') || t.includes('pastry')) return 'pain'
    // Pizza
    if (t.includes('pizza')) return 'pizza'
    // Burger / sandwich
    if (t.includes('burger') || t.includes('sandwich') || t.includes('hot_dog') || t.includes('kebab')) return 'burger'
    // Alimentaire (nourriture, boissons)
    if (t.includes('food') || t.includes('snack') || t.includes('meal') || t.includes('sweets') || t.includes('candy') || t.includes('chips')) return 'alimentaire'
    if (t.includes('drink') || t.includes('beverage') || t.includes('coffee') || t.includes('water') || t.includes('juice') || t.includes('soda') || t.includes('milk')) return 'alimentaire'
    if (t.includes('ice_cream') || t.includes('frozen') || t.includes('yogurt')) return 'alimentaire'
    if (t.includes('egg') || t.includes('meat') || t.includes('cheese') || t.includes('fruit') || t.includes('vegetable')) return 'alimentaire'
    // Fleurs
    if (t.includes('flower') || t.includes('fleur') || t.includes('plant')) return 'fleurs'
    // Parapharmacie / hygiène
    if (t.includes('medicine') || t.includes('condom') || t.includes('pharma') || t.includes('hygiene') || t.includes('sanitary') || t.includes('mask') || t.includes('test')) return 'parapharmacie'
    if (t.includes('cosmetic') || t.includes('beauty') || t.includes('sunscreen') || t.includes('bandage')) return 'parapharmacie'
    // Tout le reste
    return 'autres'
  }

  // Calcul de distance Haversine
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // ============================================
  // RECHERCHE PAR ADRESSE
  // ============================================

  const handleSearchInputChange = async (value) => {
    setSearchQuery(value)
    
    if (value.trim().length < 2) {
      setSearchSuggestions([])
      setShowSearchSuggestions(false)
      return
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&type=municipality&limit=5`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const suggestions = data.features.map(feature => ({
          label: feature.properties.label,
          city: feature.properties.city,
          postcode: feature.properties.postcode,
          coordinates: feature.geometry.coordinates
        }))
        setSearchSuggestions(suggestions)
        setShowSearchSuggestions(true)
      } else {
        setSearchSuggestions([])
        setShowSearchSuggestions(false)
      }
    } catch (error) {
      console.error('Erreur recherche ville:', error)
      setSearchSuggestions([])
    }
  }

  const handleSelectSearchSuggestion = (suggestion) => {
    const [lng, lat] = suggestion.coordinates
    setSearchQuery(suggestion.label)
    setSearchSuggestions([])
    setShowSearchSuggestions(false)
    setMapCenter([lat, lng])
  }

  const searchAddress = async (query) => {
    if (!query.trim()) return

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`
      )
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates
        setMapCenter([lat, lng])
        loadNearbyDistributors(lat, lng, selectedCategory, radius)
      }
    } catch (err) {
      console.error('Erreur recherche adresse:', err)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    searchAddress(searchQuery)
  }

  // Correction de catégorie par l'utilisateur
  const handleCorrectCategory = async (distributor, newCategory) => {
    try {
      // Sauvegarder dans distributor_reports avec type 'category_correction'
      const { error } = await supabase
        .from('distributor_reports')
        .insert({
          name: distributor.name || 'Distributeur automatique',
          address: distributor.address || '',
          latitude: distributor.latitude,
          longitude: distributor.longitude,
          category: newCategory,
          description: `Correction de catégorie (source: ${distributor.source || 'osm'}, id: ${distributor.id})`,
          status: 'pending',
          report_type: 'category_correction',
        })

      if (error) throw error

      // Mettre à jour localement l'affichage
      setSelectedDistributor(prev => ({ ...prev, category: newCategory }))
      setDistributors(prev => prev.map(d =>
        d.id === distributor.id ? { ...d, category: newCategory } : d
      ))
      setCategoryCorrectSuccess(true)
      setShowCategoryCorrection(false)
      setTimeout(() => setCategoryCorrectSuccess(false), 3000)
    } catch (err) {
      console.error('Erreur correction catégorie:', err)
    }
  }

  // ============================================
  // EFFECTS
  // ============================================

  // Vérifier l'utilisateur connecté
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  // Obtenir la position au chargement (une seule fois)
  useEffect(() => {
    // Vérifier si des coordonnées sont passées en paramètres URL (recherche de ville)
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')

    if (latParam && lngParam) {
      // Coordonnées de la ville recherchée (depuis Home ou Favoris)
      const coords = [parseFloat(latParam), parseFloat(lngParam)]
      setMapCenter(coords)
      // Lancer AUSSI la géolocalisation pour avoir le point bleu au bon endroit
      getUserLocation()
    } else {
      // Pas de ville recherchée, vérifier s'il y a une ville par défaut
      const defaultCityCoords = localStorage.getItem('defaultCityCoords')
      const locationPermission = localStorage.getItem('locationPermission')
      
      if (defaultCityCoords) {
        // Utiliser la ville par défaut
        const coords = JSON.parse(defaultCityCoords)
        setMapCenter([coords.lat, coords.lng])
        // Lancer aussi la géolocalisation si autorisée
        if (locationPermission !== 'deny') {
          getUserLocation()
        }
      } else {
        // Pas de ville par défaut, utiliser la géolocalisation
        if (locationPermission !== 'deny') {
          getUserLocation()
        } else {
          // Géolocalisation refusée et pas de ville par défaut → Paris
          setMapCenter([48.8566, 2.3522])
        }
      }
    }
  }, []) // Tableau vide = s'exécute UNE SEULE FOIS au montage
  
  // Définir mapCenter depuis userPosition si pas déjà défini
  useEffect(() => {
    if (userPosition && !mapCenter) {
      setMapCenter(userPosition)
    }
  }, [userPosition, mapCenter])

  // Charger les distributeurs quand la position ou les filtres changent
  useEffect(() => {
    if (mapCenter) {
      loadNearbyDistributors(mapCenter[0], mapCenter[1], selectedCategory, radius)
    }
  }, [mapCenter, selectedCategory, radius, loadNearbyDistributors])

  // Recalculer la distance du distributeur sélectionné quand userPosition change
  useEffect(() => {
    if (selectedDistributor && userPosition && selectedDistributor.latitude && selectedDistributor.longitude) {
      const distance = calculateDistance(
        userPosition[0], 
        userPosition[1], 
        selectedDistributor.latitude, 
        selectedDistributor.longitude
      )
      console.log('Mise à jour distance:', distance, 'km')
      setDisplayDistance(distance)
    } else if (!userPosition) {
      setDisplayDistance(null)
    }
  }, [userPosition, selectedDistributor])

  // Ouvrir automatiquement un distributeur si passé en paramètre URL
  useEffect(() => {
    const distributorId = searchParams.get('distributor')
    if (distributorId && distributors.length > 0) {
      const dist = distributors.find(d => d.id === distributorId)
      if (dist) {
        console.log('Distributeur trouvé:', dist)
        console.log('UserPosition:', userPosition)
        
        // Calculer la distance si userPosition existe
        if (userPosition && dist.latitude && dist.longitude) {
          const distance = calculateDistance(
            userPosition[0], 
            userPosition[1], 
            dist.latitude, 
            dist.longitude
          )
          console.log('Distance calculée:', distance, 'km')
          dist.distance_km = distance
        } else {
          console.log('Impossible de calculer la distance - userPosition ou coordonnées manquantes')
        }
        
        setSelectedDistributor(dist)
        setBottomSheetExpanded(true)
        checkIfFavorite(dist.id)
      }
    }
  }, [distributors, searchParams, userPosition])

  // ============================================
  // HANDLERS
  // ============================================

  const handleLocateMe = () => {
    getUserLocation()
    if (userPosition) {
      setMapCenter([...userPosition])
    }
  }

  const handleMapMove = (newCenter, bounds) => {
    if (!bounds) return
    // Calculer le rayon depuis les bounds de la carte visible
    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()
    const latDiff = Math.abs(ne.lat - sw.lat)
    const lngDiff = Math.abs(ne.lng - sw.lng)
    // Rayon = moitié de la diagonale visible en km (max 200 km)
    const radiusKm = Math.min(200, Math.max(2,
      Math.sqrt(Math.pow(latDiff * 111, 2) + Math.pow(lngDiff * 111 * Math.cos(newCenter[0] * Math.PI / 180), 2)) / 2
    ))
    loadNearbyDistributors(newCenter[0], newCenter[1], selectedCategory, radiusKm)
  }

  // Géocodage inversé : coordonnées → adresse via api-adresse.data.gouv.fr
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`
      )
      const data = await res.json()
      if (data.features && data.features.length > 0) {
        const props = data.features[0].properties
        return props.label || null
      }
    } catch (err) {
      console.warn('Géocodage inversé échoué:', err)
    }
    return null
  }

  const handleMarkerClick = async (distributor) => {
    // Réinitialiser la distance affichée
    setDisplayDistance(null)

    // Calculer la distance si userPosition existe
    if (userPosition && distributor.latitude && distributor.longitude) {
      const distance = calculateDistance(
        userPosition[0],
        userPosition[1],
        distributor.latitude,
        distributor.longitude
      )
      distributor.distance_km = distance
      setDisplayDistance(distance)
    }

    // Afficher immédiatement, puis compléter l'adresse si manquante
    setSelectedDistributor(distributor)
    setBottomSheetExpanded(true)
    checkIfFavorite(distributor.id)

    const addressManquante =
      !distributor.address ||
      distributor.address === 'Adresse inconnue' ||
      distributor.address.trim() === ''

    if (addressManquante && distributor.latitude && distributor.longitude) {
      const adresse = await reverseGeocode(distributor.latitude, distributor.longitude)
      if (adresse) {
        setSelectedDistributor(prev => prev ? { ...prev, address: adresse } : prev)
      }
    }
  }

  const checkIfFavorite = async (distributorId) => {
    if (!user) {
      setIsFavorite(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('distributor_id', distributorId)
        .single()

      setIsFavorite(!!data)
    } catch (error) {
      setIsFavorite(false)
    }
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setShowFilters(false)
  }

  const handleNavigate = (distributor) => {
    navigate(`/distributor/${distributor.id}`)
  }

  const handleItinerary = (distributor) => {
    if (distributor.latitude && distributor.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${distributor.latitude},${distributor.longitude}`,
        '_blank'
      )
    }
  }

  const handleAddToFavorites = async (distributor) => {
    if (!user) {
      alert('Connectez-vous pour ajouter des favoris')
      navigate('/login')
      return
    }

    try {
      if (isFavorite) {
        // Retirer des favoris
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('distributor_id', distributor.id)

        if (error) throw error

        setIsFavorite(false)
        alert('💔 Retiré des favoris')
      } else {
        // Ajouter aux favoris
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            distributor_id: distributor.id
          }])

        if (error) {
          if (error.code === '23505') {
            alert('✅ Déjà dans vos favoris')
          } else {
            throw error
          }
        } else {
          setIsFavorite(true)
          alert('❤️ Ajouté aux favoris !')
        }
      }
    } catch (error) {
      alert('Erreur : ' + error.message)
    }
  }

  const handleShare = (distributor) => {
    const text = `${distributor.name}\n${distributor.address}`
    const url = `${window.location.origin}/map?distributor=${distributor.id}&lat=${distributor.latitude}&lng=${distributor.longitude}`
    
    if (navigator.share) {
      // Utiliser l'API Web Share si disponible
      navigator.share({
        title: distributor.name,
        text: text,
        url: url
      }).catch(() => {})
    } else {
      // Fallback: proposer SMS ou Email
      const choice = confirm('Partager par Email (OK) ou SMS (Annuler) ?')
      
      if (choice) {
        // Email
        const subject = encodeURIComponent(`Distributeur: ${distributor.name}`)
        const body = encodeURIComponent(`${text}\n\nVoir sur DA24/7: ${url}`)
        window.location.href = `mailto:?subject=${subject}&body=${body}`
      } else {
        // SMS
        const smsBody = encodeURIComponent(`${text}\n${url}`)
        window.location.href = `sms:?body=${smsBody}`
      }
    }
  }

  // ============================================
  // RENDU
  // ============================================

  // Écran de chargement initial
  if (!mapCenter) {
    return (
      <div className="h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-accent-gray">Localisation en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen pb-20">
      {/* ============================================ */}
      {/* BARRE DE RECHERCHE */}
      {/* ============================================ */}
      <div className="absolute top-4 left-4 right-4 z-[1000] space-y-2">
        <div className="relative">
          <form onSubmit={handleSearchSubmit} className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
            <Search size={20} className="text-accent-gray flex-shrink-0" />
            <input
              type="text"
              placeholder="Ville, adresse ou code postal..."
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSearchSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
              className="flex-1 outline-none text-sm"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => {
                  setSearchQuery('')
                  setSearchSuggestions([])
                  setShowSearchSuggestions(false)
                }}
              >
                <X size={18} className="text-accent-gray" />
              </button>
            )}
          </form>

          {/* Liste de suggestions */}
          {showSearchSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSearchSuggestion(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-black">{suggestion.city}</div>
                  <div className="text-sm text-gray-600">{suggestion.postcode}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtres catégories */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value || 'all'}
              onClick={() => handleCategoryChange(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 shadow-sm'
              }`}
            >
              <img src={cat.icon} alt={cat.label} className="w-5 h-5 object-contain flex-shrink-0" />
              <span className="font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* BOUTONS FLOTTANTS */}
      {/* ============================================ */}
      
      {/* Bouton de localisation */}
      <button
        onClick={handleLocateMe}
        className="absolute bottom-28 right-4 z-[1000] bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
        title="Ma position"
      >
        <Navigation size={24} className="text-primary" />
      </button>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Recherche...</span>
          </div>
        </div>
      )}

      {/* Compteur de résultats */}
      {!loading && distributors.length > 0 && (
        <div className="absolute top-32 left-4 z-[1000] bg-white px-3 py-1.5 rounded-full shadow-md">
          <span className="text-sm font-medium text-gray-700">
            {distributors.length} distributeur{distributors.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* ============================================ */}
      {/* CARTE */}
      {/* ============================================ */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController position={mapCenter} onMapMove={handleMapMove} />
        <UserLocationMarker position={userPosition} />

        {/* Marqueurs des distributeurs */}
        {distributors.map((distributor) => (
          <Marker
            key={distributor.id}
            position={[distributor.latitude, distributor.longitude]}
            icon={createCategoryIcon(distributor.category)}
            eventHandlers={{
              click: () => handleMarkerClick(distributor),
            }}
          />
        ))}
      </MapContainer>

      {/* ============================================ */}
      {/* BOTTOM SHEET */}
      {/* ============================================ */}
      {selectedDistributor && (
        <div 
          className={`absolute bottom-20 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[1000] transition-all duration-300 ${
            bottomSheetExpanded ? 'max-h-[60vh]' : 'max-h-32'
          }`}
        >
          {/* Handle */}
          <button
            onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
            className="w-full pt-2 pb-1"
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto"></div>
          </button>

          {/* Contenu */}
          <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: bottomSheetExpanded ? 'calc(60vh - 40px)' : '100px' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <img 
                    src={categoryIcons[selectedDistributor.category]?.icon || categoryIcons.default.icon}
                    alt={selectedDistributor.category}
                    className="w-8 h-8 object-contain"
                  />
                  <h3 className="font-bold text-lg">{selectedDistributor.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{selectedDistributor.address}</p>
              </div>
              <button
                onClick={() => setSelectedDistributor(null)}
                className="p-1"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Distance */}
            {(displayDistance || selectedDistributor.distance_km) && (
              <div className="flex items-center gap-1 text-primary font-medium text-sm mb-3">
                <MapPin size={14} />
                <span>À {(displayDistance || selectedDistributor.distance_km).toFixed(1)} km</span>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="space-y-2">
              {/* Bouton ITINÉRAIRE */}
              <button
                onClick={() => handleItinerary(selectedDistributor)}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm"
              >
                ITINÉRAIRE
              </button>
              
              {/* Boutons FAVORI et PARTAGER */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToFavorites(selectedDistributor)}
                  className={`flex-1 border-2 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 ${
                    isFavorite 
                      ? 'bg-primary border-primary text-white' 
                      : 'border-primary text-primary'
                  }`}
                >
                  <Heart size={18} className={isFavorite ? 'fill-white' : ''} />
                  {isFavorite ? 'RETIRER DES FAVORIS' : 'AJOUTER EN FAVORI'}
                </button>
                <button
                  onClick={() => handleShare(selectedDistributor)}
                  className="flex-1 border-2 border-primary text-primary py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  PARTAGER
                </button>
              </div>
            </div>

            {/* Infos supplémentaires (si expandé) */}
            {bottomSheetExpanded && selectedDistributor.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">{selectedDistributor.description}</p>
              </div>
            )}

            {/* Correction de catégorie (si expandé) */}
            {bottomSheetExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {!showCategoryCorrection ? (
                  <button
                    onClick={() => setShowCategoryCorrection(true)}
                    className="text-xs text-gray-400 underline w-full text-center"
                  >
                    ✏️ Catégorie incorrecte ? Suggérer une correction
                  </button>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Sélectionne la bonne catégorie :</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'pain', label: 'Pain', icon: iconPain },
                        { value: 'pizza', label: 'Pizza', icon: iconPizza },
                        { value: 'burger', label: 'Burger', icon: iconBurger },
                        { value: 'alimentaire', label: 'Alimentaire', icon: iconAlimentaire },
                        { value: 'fleurs', label: 'Fleurs', icon: iconFleurs },
                        { value: 'parapharmacie', label: 'Pharma', icon: iconParapharmacie },
                        { value: 'autres', label: 'Autres', icon: iconAutres },
                      ].map(cat => (
                        <button
                          key={cat.value}
                          onClick={() => handleCorrectCategory(selectedDistributor, cat.value)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border-2 transition ${
                            selectedDistributor.category === cat.value
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          <img src={cat.icon} alt={cat.label} className="w-4 h-4 object-contain" />
                          {cat.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowCategoryCorrection(false)}
                      className="text-xs text-gray-400 mt-2 w-full text-center"
                    >
                      Annuler
                    </button>
                  </div>
                )}
                {categoryCorrectSuccess && (
                  <p className="text-xs text-green-600 text-center mt-1">✅ Merci pour votre correction !</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {!loading && distributors.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] bg-white px-6 py-4 rounded-xl shadow-lg text-center">
          <p className="text-gray-600 mb-2">Aucun distributeur trouvé</p>
          <p className="text-sm text-gray-400">Essayez d'élargir votre recherche</p>
        </div>
      )}
    </div>
  )
}
