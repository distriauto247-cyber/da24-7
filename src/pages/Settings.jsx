import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, MapPin, Bell, Info, Shield, FileText, User as UserIcon, X, SettingsIcon as SettingsIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePushNotifications } from '../hooks/usePushNotifications'

export default function Settings({ user }) {
  const navigate = useNavigate()
  const { permission, loading, requestPermission, isSupported, isGranted } = usePushNotifications(user)
  
  const [notifications, setNotifications] = useState({
    newMachinesInCities: true,
    favoritesUpdates: true,
    favoriteCategories: false,
    appUpdates: false,
  })
  
  // Villes surveillées pour les notifications
  const [watchedCities, setWatchedCities] = useState([])
  const [showCitiesModal, setShowCitiesModal] = useState(false)
  const [citySearchNotif, setCitySearchNotif] = useState('')
  const [citySuggestionsNotif, setCitySuggestionsNotif] = useState([])
  const [showCitySuggestionsNotif, setShowCitySuggestionsNotif] = useState(false)
  
  // Catégories favorites pour les notifications
  const [favoriteCategories, setFavoriteCategories] = useState([])
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  
  // Vérification admin
  const [isAdmin, setIsAdmin] = useState(false)
  
  // États pour la localisation
  const [locationPermission, setLocationPermission] = useState('allow') // 'allow' ou 'deny'
  const [searchDistance, setSearchDistance] = useState(10) // 5, 10, 20, 50 km
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showDistanceModal, setShowDistanceModal] = useState(false)
  
  // Ville par défaut
  const [defaultCity, setDefaultCity] = useState('')
  const [defaultCityCoords, setDefaultCityCoords] = useState(null)
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  // Charger les préférences au démarrage
  useEffect(() => {
    const savedPermission = localStorage.getItem('locationPermission')
    const savedDistance = localStorage.getItem('searchDistance')
    const savedCity = localStorage.getItem('defaultCity')
    const savedCityCoords = localStorage.getItem('defaultCityCoords')
    const savedWatchedCities = localStorage.getItem('watchedCities')
    const savedFavoriteCategories = localStorage.getItem('favoriteCategories')
    const savedNotifications = localStorage.getItem('notifications')
    
    if (savedPermission) setLocationPermission(savedPermission)
    if (savedDistance) setSearchDistance(parseInt(savedDistance))
    if (savedCity) setDefaultCity(savedCity)
    if (savedCityCoords) setDefaultCityCoords(JSON.parse(savedCityCoords))
    if (savedWatchedCities) setWatchedCities(JSON.parse(savedWatchedCities))
    if (savedFavoriteCategories) setFavoriteCategories(JSON.parse(savedFavoriteCategories))
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
    
    // Vérifier si l'utilisateur est admin
    if (user) {
      checkAdminRole()
    }
  }, [user])

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (!error && data && data.role === 'admin') {
        setIsAdmin(true)
      }
    } catch (error) {
      // Pas admin ou erreur, on ne fait rien
      setIsAdmin(false)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      navigate('/login')
    }
  }

  // Fonction pour rechercher des suggestions de villes
  const handleCitySearchChange = async (value) => {
    setDefaultCity(value)
    
    if (value.trim().length < 2) {
      setCitySuggestions([])
      setShowCitySuggestions(false)
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
        setCitySuggestions(suggestions)
        setShowCitySuggestions(true)
      } else {
        setCitySuggestions([])
        setShowCitySuggestions(false)
      }
    } catch (error) {
      console.error('Erreur recherche ville:', error)
      setCitySuggestions([])
    }
  }

  const handleSelectCity = (suggestion) => {
    const [lng, lat] = suggestion.coordinates
    setDefaultCity(suggestion.label)
    setDefaultCityCoords({ lat, lng })
    setCitySuggestions([])
    setShowCitySuggestions(false)
    
    // Sauvegarder dans localStorage
    localStorage.setItem('defaultCity', suggestion.label)
    localStorage.setItem('defaultCityCoords', JSON.stringify({ lat, lng }))
    
    // Si connecté, sauvegarder aussi dans Supabase
    if (user) {
      supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          default_city: suggestion.label,
          default_city_lat: lat,
          default_city_lng: lng
        })
        .then(({ error }) => {
          if (error) console.error('Erreur sauvegarde Supabase:', error)
        })
    }
  }

  const handleClearCity = () => {
    setDefaultCity('')
    setDefaultCityCoords(null)
    localStorage.removeItem('defaultCity')
    localStorage.removeItem('defaultCityCoords')
    
    if (user) {
      supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id)
    }
  }

  // Gestion des villes surveillées pour notifications
  const handleCitySearchNotif = async (value) => {
    setCitySearchNotif(value)
    
    if (value.trim().length < 2) {
      setCitySuggestionsNotif([])
      setShowCitySuggestionsNotif(false)
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
        }))
        setCitySuggestionsNotif(suggestions)
        setShowCitySuggestionsNotif(true)
      }
    } catch (error) {
      console.error('Erreur recherche ville:', error)
    }
  }

  const handleAddWatchedCity = (suggestion) => {
    if (watchedCities.length >= 3) {
      alert('Maximum 3 villes surveillées')
      return
    }
    
    if (watchedCities.some(c => c.city === suggestion.city)) {
      alert('Cette ville est déjà surveillée')
      return
    }
    
    const newWatchedCities = [...watchedCities, suggestion]
    setWatchedCities(newWatchedCities)
    localStorage.setItem('watchedCities', JSON.stringify(newWatchedCities))
    setCitySearchNotif('')
    setCitySuggestionsNotif([])
  }

  const handleRemoveWatchedCity = (cityToRemove) => {
    const newWatchedCities = watchedCities.filter(c => c.city !== cityToRemove.city)
    setWatchedCities(newWatchedCities)
    localStorage.setItem('watchedCities', JSON.stringify(newWatchedCities))
  }

  // Gestion des catégories favorites pour notifications
  const handleToggleFavoriteCategory = (category) => {
    let newCategories
    if (favoriteCategories.includes(category)) {
      newCategories = favoriteCategories.filter(c => c !== category)
    } else {
      if (favoriteCategories.length >= 3) {
        alert('Maximum 3 catégories favorites')
        return
      }
      newCategories = [...favoriteCategories, category]
    }
    setFavoriteCategories(newCategories)
    localStorage.setItem('favoriteCategories', JSON.stringify(newCategories))
  }

  const handleToggleNotification = (key) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] }
    setNotifications(newNotifications)
    localStorage.setItem('notifications', JSON.stringify(newNotifications))
  }

  return (
    <div className="min-h-screen bg-secondary pb-20">
      {/* Compte Section */}
      <div className="bg-white mb-4 p-4">
        <h2 className="text-primary font-bold text-lg mb-4">Compte</h2>
        
        {user ? (
          <>
            <button 
              onClick={() => navigate('/account')}
              className="w-full flex items-center justify-between py-3 border-b border-gray-200"
            >
              <div className="text-left">
                <div className="font-medium">Mon compte</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
              <ChevronRight size={20} className="text-accent-gray" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left py-3 text-gray-600"
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-between py-3 border-b border-gray-200"
          >
            <span>Se connecter</span>
            <ChevronRight size={20} className="text-accent-gray" />
          </button>
        )}
      </div>

      {/* Localisation Section */}
      <div className="bg-white mb-4 p-4">
        <h2 className="text-primary font-bold text-lg mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Localisation
        </h2>
        
        <div className="space-y-3">
          {/* Autorisation de localisation */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="w-full flex items-center justify-between py-2"
          >
            <span>Autorisation de localisation</span>
            <div className="flex items-center gap-2">
              <span className="text-accent-gray">
                {locationPermission === 'allow' ? 'Autoriser' : 'Refuser'}
              </span>
              <ChevronRight size={20} className="text-accent-gray" />
            </div>
          </button>
          
          {/* Distance de recherche */}
          <button
            onClick={() => setShowDistanceModal(true)}
            className="w-full flex items-center justify-between py-2"
          >
            <span>Distance de recherche</span>
            <div className="flex items-center gap-2">
              <span className="text-accent-gray">{searchDistance} km</span>
              <ChevronRight size={20} className="text-accent-gray" />
            </div>
          </button>
          
          {/* Ville par défaut */}
          <div className="pt-3">
            <label className="block text-sm text-accent-gray mb-2">
              Ville ou Code Postal par défaut
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une ville..."
                value={defaultCity}
                onChange={(e) => handleCitySearchChange(e.target.value)}
                onFocus={() => defaultCity.trim().length >= 2 && setShowCitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 outline-none focus:border-primary transition"
              />
              {defaultCity && (
                <button
                  onClick={handleClearCity}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
              
              {/* Suggestions */}
              {showCitySuggestions && citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {citySuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectCity(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 transition border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-black">{suggestion.city}</div>
                      <div className="text-sm text-gray-600">{suggestion.postcode}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {defaultCity && (
              <p className="text-xs text-gray-500 mt-1">
                La carte s'ouvrira sur cette ville par défaut
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modale Autorisation de localisation */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Autorisation de localisation</h3>
            
            <div className="space-y-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="location"
                  checked={locationPermission === 'allow'}
                  onChange={() => setLocationPermission('allow')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Autoriser</div>
                  <div className="text-sm text-gray-600">Quand l'application est ouverte</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="location"
                  checked={locationPermission === 'deny'}
                  onChange={() => setLocationPermission('deny')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Refuser</div>
                  <div className="text-sm text-gray-600">Seule la recherche par ville sera possible</div>
                </div>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLocationModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowLocationModal(false)
                  // Sauvegarder dans localStorage
                  localStorage.setItem('locationPermission', locationPermission)
                }}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-bold"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Distance de recherche */}
      {showDistanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Distance de recherche</h3>
            
            <div className="space-y-3 mb-6">
              {[5, 10, 20, 50].map((distance) => (
                <label key={distance} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="distance"
                    checked={searchDistance === distance}
                    onChange={() => setSearchDistance(distance)}
                  />
                  <span className="font-medium">{distance} km</span>
                  {distance === 10 && <span className="text-xs text-gray-500">(par défaut)</span>}
                </label>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDistanceModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowDistanceModal(false)
                  // Sauvegarder dans localStorage
                  localStorage.setItem('searchDistance', searchDistance)
                }}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-bold"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      <div className="bg-white mb-4 p-4">
        <h2 className="text-primary font-bold text-lg mb-4 flex items-center gap-2">
          <Bell size={20} />
          Notifications
        </h2>
        
        {/* Activation des notifications push */}
        {isSupported && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <Bell size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">Notifications Push</h3>
                <p className="text-sm text-blue-800">
                  Recevez des alertes en temps réel sur votre téléphone
                </p>
              </div>
            </div>
            
            {!isGranted ? (
              <button
                onClick={requestPermission}
                disabled={loading || permission === 'denied'}
                className={`w-full py-3 rounded-lg font-bold transition ${
                  permission === 'denied'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Activation...' : permission === 'denied' ? 'Permission refusée' : 'Activer les notifications'}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Notifications activées</span>
              </div>
            )}
            
            {permission === 'denied' && (
              <p className="text-xs text-gray-600 mt-2">
                Vous avez refusé les notifications. Réactivez-les dans les paramètres de votre navigateur.
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-5">
          {/* Nouvelles machines dans mes villes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <div className="font-medium">Nouvelles machines dans mes villes</div>
                <div className="text-xs text-gray-500">Max 1 notification/jour</div>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={notifications.newMachinesInCities}
                  onChange={() => handleToggleNotification('newMachinesInCities')}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
              </label>
            </div>
            
            {/* Villes surveillées */}
            <button
              onClick={() => setShowCitiesModal(true)}
              className="w-full text-left bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition"
            >
              <div className="text-sm font-medium mb-1">Villes surveillées ({watchedCities.length}/3)</div>
              {watchedCities.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchedCities.map((city, index) => (
                    <span key={index} className="text-xs bg-white px-2 py-1 rounded-full border">
                      {city.city}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">Aucune ville surveillée</div>
              )}
            </button>
          </div>

          {/* Catégories favorites */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <div className="font-medium">Mes catégories préférées</div>
                <div className="text-xs text-gray-500">Nouvelles machines de ces catégories</div>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={notifications.favoriteCategories}
                  onChange={() => handleToggleNotification('favoriteCategories')}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
              </label>
            </div>
            
            <button
              onClick={() => setShowCategoriesModal(true)}
              className="w-full text-left bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition"
            >
              <div className="text-sm font-medium mb-1">Catégories favorites ({favoriteCategories.length}/3)</div>
              {favoriteCategories.length > 0 ? (
                <div className="text-xs text-gray-600">{favoriteCategories.join(', ')}</div>
              ) : (
                <div className="text-xs text-gray-500">Aucune catégorie sélectionnée</div>
              )}
            </button>
          </div>

          {/* Mises à jour de mes favoris */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Mises à jour de mes favoris</div>
              <div className="text-xs text-gray-500">Photos, horaires ou produits mis à jour</div>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={notifications.favoritesUpdates}
                onChange={() => handleToggleNotification('favoritesUpdates')}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
            </label>
          </div>

          {/* Nouvelles fonctionnalités */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Nouvelles fonctionnalités</div>
              <div className="text-xs text-gray-500">Max 1 fois/mois - Annonces importantes</div>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={notifications.appUpdates}
                onChange={() => handleToggleNotification('appUpdates')}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-primary transition-colors"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
            </label>
          </div>
        </div>
      </div>

      {/* À propos Section */}
      <div className="bg-white mb-4 p-4">
        <h2 className="text-primary font-bold text-lg mb-4 flex items-center gap-2">
          <Info size={20} />
          À propos
        </h2>
        
        <button
          onClick={() => navigate('/app-version')}
          className="w-full flex items-center justify-between py-3 border-b border-gray-200"
        >
          <span>Version 1.0.0 (build 12)</span>
          <span className="text-accent-gray underline">Informations version</span>
        </button>
        
        <div className="py-3 text-accent-lightgray text-sm">
          Dernière mise à jour le 20 décembre 2025
        </div>
        
        <div className="py-3 text-accent-lightgray text-sm">
          Contact support : distriauto24.7@gmail.com
        </div>
        
        <button
          onClick={() => navigate('/faq')}
          className="w-full flex items-center justify-between py-3 border-b border-gray-200"
        >
          <span className="text-accent-lightgray text-sm">FAQ</span>
          <ChevronRight size={18} className="text-accent-gray" />
        </button>
        
        <div className="py-3 text-accent-lightgray">
          DA24.7 est une application communautaire indépendante.
        </div>
        
        {/* Bouton Admin (visible uniquement pour les admins) */}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full mt-3 py-3 border-t border-gray-200 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <SettingsIcon size={18} className="text-gray-500" />
              <span className="text-gray-600">Administration</span>
            </div>
            <ChevronRight size={20} className="text-accent-gray" />
          </button>
        )}
      </div>

      {/* Légal Section */}
      <div className="bg-white p-4">
        <h2 className="text-primary font-bold text-lg mb-4 flex items-center gap-2">
          <Shield size={20} />
          Légal
        </h2>
        
        <button className="w-full text-left py-3 border-b border-gray-200">
          Politique de confidentialité
        </button>
        
        <button className="w-full text-left py-3 border-b border-gray-200">
          Conditions d'utilisation
        </button>
        
        <button className="w-full text-left py-3">
          Données personnelles
        </button>
      </div>

      {/* Modale Villes surveillées */}
      {showCitiesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Villes surveillées</h3>
            <p className="text-sm text-gray-600 mb-4">
              Recevez une notification quand une nouvelle machine est ajoutée dans ces villes (max 3).
            </p>
            
            {/* Champ de recherche */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Rechercher une ville..."
                value={citySearchNotif}
                onChange={(e) => handleCitySearchNotif(e.target.value)}
                onFocus={() => citySearchNotif.trim().length >= 2 && setShowCitySuggestionsNotif(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestionsNotif(false), 200)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-primary"
              />
              
              {/* Suggestions */}
              {showCitySuggestionsNotif && citySuggestionsNotif.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {citySuggestionsNotif.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddWatchedCity(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 transition border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-black">{suggestion.city}</div>
                      <div className="text-sm text-gray-600">{suggestion.postcode}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Liste des villes surveillées */}
            {watchedCities.length > 0 && (
              <div className="space-y-2 mb-4">
                {watchedCities.map((city, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <div className="font-medium">{city.city}</div>
                      <div className="text-sm text-gray-600">{city.postcode}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveWatchedCity(city)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowCitiesModal(false)}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modale Catégories favorites */}
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Catégories favorites</h3>
            <p className="text-sm text-gray-600 mb-4">
              Sélectionnez jusqu'à 3 catégories pour recevoir des notifications (max 3).
            </p>
            
            <div className="space-y-2 mb-6">
              {['Pain', 'Pizza', 'Burger', 'Alimentaire', 'Fleurs', 'Parapharmacie', 'Autres'].map((category) => (
                <label key={category} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={favoriteCategories.includes(category)}
                    onChange={() => handleToggleFavoriteCategory(category)}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">{category}</span>
                </label>
              ))}
            </div>
            
            <button
              onClick={() => setShowCategoriesModal(false)}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-accent-gray mb-2">
          <MapPin size={20} />
          <span className="font-bold">DA24.7</span>
        </div>
        <p className="text-accent-lightgray text-sm">
          © DA24.7 – Tous droits réservés
        </p>
      </div>
    </div>
  )
}
