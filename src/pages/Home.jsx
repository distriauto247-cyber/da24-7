import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import Logo from '../components/Logo'
import Button from '../components/Button'

// Import des icônes de catégories
import iconPain from '../assets/icons/pain.png'
import iconPizza from '../assets/icons/pizza.png'
import iconBurger from '../assets/icons/burger.png'
import iconAlimentaire from '../assets/icons/alimentaire.png'
import iconFleurs from '../assets/icons/fleurs.png'
import iconParapharmacie from '../assets/icons/parapharmacie.png'
import iconAutres from '../assets/icons/autres.png'

// Import des icônes de navigation
import iconCarte from '../assets/icons/carte.png'
import iconFavoris from '../assets/icons/favoris.png'
import iconParametres from '../assets/icons/parametres.png'
import iconInstallateur from '../assets/icons/installateur.svg'

export default function Home() {
  const navigate = useNavigate()
  const [locationMode, setLocationMode] = useState('nearby')
  const [citySearch, setCitySearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)

  // Fonction pour obtenir la géolocalisation
  const handleNearbySearch = () => {
    setLocationMode('nearby')
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ latitude, longitude })
          setLocationError(null)
          console.log('Position trouvée:', latitude, longitude)
          
          // Naviguer vers la carte avec les coordonnées
          navigate(`/map?lat=${latitude}&lng=${longitude}`)
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error)
          setLocationError("Impossible d'accéder à votre position. Veuillez autoriser la géolocalisation.")
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setLocationError("Votre navigateur ne supporte pas la géolocalisation.")
    }
  }

  // Fonction pour rechercher des suggestions de villes/codes postaux
  const handleCitySearchChange = async (value) => {
    setCitySearch(value)
    
    if (value.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&type=municipality&limit=5`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const uniqueSuggestions = data.features.map(feature => ({
          label: feature.properties.label,
          city: feature.properties.city,
          postcode: feature.properties.postcode,
          coordinates: feature.geometry.coordinates
        }))
        setSuggestions(uniqueSuggestions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Erreur recherche ville:', error)
      setSuggestions([])
    }
  }

  // Fonction pour sélectionner une suggestion
  const handleSelectSuggestion = (suggestion) => {
    const [lng, lat] = suggestion.coordinates
    setCitySearch(suggestion.label)
    setSuggestions([])
    setShowSuggestions(false)
    
    // Naviguer vers la carte avec les coordonnées de la ville
    navigate(`/map?lat=${lat}&lng=${lng}`)
  }

  const categories = [
    { icon: iconPain, label: 'Pain', value: 'pain' },
    { icon: iconPizza, label: 'Pizza', value: 'pizza' },
    { icon: iconBurger, label: 'Burger', value: 'burger' },
    { icon: iconAlimentaire, label: 'Alimentaire', value: 'alimentaire' },
    { icon: iconFleurs, label: 'Fleurs', value: 'fleurs' },
    { icon: iconParapharmacie, label: 'Parapharmacie', value: 'parapharmacie' },
    { icon: iconAutres, label: 'Autres', value: 'autres' },
  ]

  return (
    <div className="min-h-screen bg-secondary px-4 pt-3 pb-24">
      {/* Logo */}
      <div className="flex justify-center mb-1">
        <Logo size="md" />
      </div>

      {/* Titre */}
      <h1 className="text-2xl font-bold text-center mb-6">DISTRIBUTEURS</h1>

      {/* Recherche par localisation */}
      <div className="space-y-3 mb-6">
        {/* Autour de moi */}
        <button 
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between text-left"
          onClick={handleNearbySearch}
        >
          <span className={locationMode === 'nearby' ? 'text-black' : 'text-accent-lightgray'}>
            Autour de moi
          </span>
          <ChevronDown size={20} className="text-accent-gray" />
        </button>

        {/* Afficher l'erreur si géolocalisation échoue */}
        {locationError && (
          <div className="text-red-500 text-sm px-2">
            {locationError}
          </div>
        )}

        {/* Ville ou code postal */}
        <div className="relative">
          <input
            type="text"
            placeholder="Ville ou code postal"
            value={citySearch}
            onChange={(e) => handleCitySearchChange(e.target.value)}
            onFocus={() => citySearch.trim().length >= 2 && setShowSuggestions(true)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black outline-none focus:border-primary transition"
          />
          
          {/* Liste de suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-black">{suggestion.city}</div>
                  <div className="text-sm text-gray-600">{suggestion.postcode}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Catégories */}
      <div className="mb-6">
        <h2 className="text-base font-bold mb-2">Catégories</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.slice(0, 4).map((category) => (
            <button
              key={category.value}
              className="flex flex-col items-center w-16"
              onClick={() => navigate(`/map?category=${category.value}`)}
            >
              <img 
                src={category.icon} 
                alt={category.label}
                className="w-12 h-12 mb-1 object-contain"
              />
              <span className="text-xs text-center text-black font-bold">{category.label}</span>
            </button>
          ))}
          <div className="w-full"></div>
          <div className="flex justify-center gap-2 w-full">
            {categories.slice(4).map((category) => (
              <button
                key={category.value}
                className="flex flex-col items-center w-16"
                onClick={() => navigate(`/map?category=${category.value}`)}
              >
                <img 
                  src={category.icon} 
                  alt={category.label}
                  className="w-12 h-12 mb-1 object-contain"
                />
                <span className="text-xs text-center text-black font-bold">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton Signaler une machine */}
      <Button onClick={() => navigate('/add-distributor')} className="mb-3 text-lg text-white py-4">
        📍 SIGNALER UNE MACHINE
      </Button>

      {/* Section installateurs partenaires */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold">Installateurs partenaires</h2>
          <button onClick={() => navigate('/installers')} className="text-xs text-primary font-medium">Voir tous →</button>
        </div>
        <button
          onClick={() => navigate('/installers')}
          className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border border-gray-100"
        >
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <img src={iconInstallateur} alt="Installateurs" className="w-8 h-8 object-contain" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-black text-sm">Trouver un installateur</p>
            <p className="text-xs text-gray-500 mt-0.5">Professionnels de la distribution automatique</p>
          </div>
          <span className="text-gray-300 text-lg">›</span>
        </button>
      </div>

      {/* Barre de navigation en bas */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button 
            onClick={() => navigate('/map')}
            className="flex flex-col items-center gap-1"
          >
            <img src={iconCarte} alt="Carte directe" className="w-6 h-6" />
            <span className="text-xs text-black font-medium">Carte directe</span>
          </button>
          
          <button 
            onClick={() => navigate('/favorites')}
            className="flex flex-col items-center gap-1"
          >
            <img src={iconFavoris} alt="Favoris" className="w-6 h-6" />
            <span className="text-xs text-black font-medium">Favoris</span>
          </button>
          
          <button 
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center gap-1"
          >
            <img src={iconParametres} alt="Paramètres" className="w-6 h-6" />
            <span className="text-xs text-black font-medium">Paramètres</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
