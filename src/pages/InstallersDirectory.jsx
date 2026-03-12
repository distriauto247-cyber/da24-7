import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Search, MapPin, Phone, Mail, Globe, Star, ChevronRight,
  Filter, Award, CheckCircle, Building2, Wrench, X
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// ============================================
// CONFIGURATION
// ============================================

const specialties = [
  { value: 'all', label: 'Tous', icon: '🏢' },
  { value: 'food', label: 'Alimentaire', icon: '🍕' },
  { value: 'beverage', label: 'Boissons', icon: '☕' },
  { value: 'fresh', label: 'Produits frais', icon: '🥬' },
  { value: 'non_food', label: 'Non alimentaire', icon: '💊' },
  { value: 'custom', label: 'Sur mesure', icon: '🔧' },
]

const services = [
  { value: 'installation', label: 'Installation', icon: '🔧' },
  { value: 'maintenance', label: 'Maintenance', icon: '🛠️' },
  { value: 'supply', label: 'Approvisionnement', icon: '📦' },
  { value: 'rental', label: 'Location', icon: '📋' },
  { value: 'sale', label: 'Vente', icon: '💰' },
]

// ============================================
// COMPOSANT CARD INSTALLATEUR
// ============================================

function InstallerCard({ installer, onContact, onViewDetails }) {
  const isPremium = installer.subscription_type === 'premium' || installer.subscription_type === 'enterprise'

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${isPremium ? 'ring-2 ring-primary' : ''}`}>
      {/* Badge Premium */}
      {isPremium && (
        <div className="bg-primary text-white text-xs font-bold px-3 py-1 flex items-center gap-1">
          <Award size={12} />
          PARTENAIRE VÉRIFIÉ
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Logo */}
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {installer.logo_url ? (
              <img src={installer.logo_url} alt={installer.company_name} className="w-full h-full object-contain" />
            ) : (
              <Building2 size={28} className="text-gray-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 line-clamp-1">{installer.company_name}</h3>
            
            {/* Localisation */}
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <MapPin size={12} />
              <span className="line-clamp-1">{installer.city} ({installer.department})</span>
            </div>

            {/* Rating */}
            {installer.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{installer.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({installer.review_count} avis)</span>
              </div>
            )}
          </div>
        </div>

        {/* Spécialités */}
        <div className="flex flex-wrap gap-1 mb-3">
          {(installer.specialties || []).slice(0, 3).map((spec, i) => {
            const specialty = specialties.find(s => s.value === spec)
            return (
              <span 
                key={i}
                className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {specialty?.icon} {specialty?.label || spec}
              </span>
            )
          })}
          {(installer.specialties || []).length > 3 && (
            <span className="text-xs text-gray-400">+{installer.specialties.length - 3}</span>
          )}
        </div>

        {/* Description courte */}
        {installer.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {installer.description}
          </p>
        )}

        {/* Services */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(installer.services || []).map((service, i) => {
            const srv = services.find(s => s.value === service)
            return (
              <span 
                key={i}
                className="inline-flex items-center gap-1 text-xs border border-primary/30 text-primary px-2 py-0.5 rounded"
              >
                <CheckCircle size={10} />
                {srv?.label || service}
              </span>
            )
          })}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2">
          <button
            onClick={() => onContact(installer)}
            className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-1"
          >
            <Phone size={14} />
            Contacter
          </button>
          <button
            onClick={() => onViewDetails(installer)}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-1"
          >
            Voir la fiche
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MODAL CONTACT
// ============================================

function ContactModal({ installer, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    project_type: 'installation',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Enregistrer le lead dans Supabase
      const { error } = await supabase
        .from('installer_leads')
        .insert([{
          installer_id: installer.id,
          ...form,
          status: 'new',
          created_at: new Date().toISOString(),
        }])

      if (error) throw error

      alert('Votre demande a été envoyée !')
      onClose()
    } catch (err) {
      console.error('Erreur envoi:', err)
      alert('Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold text-lg">Contacter {installer.company_name}</h2>
          <button onClick={onClose} className="p-1">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="jean@exemple.fr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Votre entreprise</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Nom de votre société"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de projet</label>
            <select
              value={form.project_type}
              onChange={(e) => setForm({ ...form, project_type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="installation">Installation neuve</option>
              <option value="replacement">Remplacement</option>
              <option value="maintenance">Maintenance</option>
              <option value="rental">Location</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Votre message *</label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Décrivez votre projet..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold"
          >
            {loading ? 'Envoi...' : 'Envoyer ma demande'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Vos données sont transmises uniquement à l'installateur contacté.
          </p>
        </form>
      </div>
    </div>
  )
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function InstallersDirectory() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // États
  const [installers, setInstallers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || 'all')
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('dept') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [contactModal, setContactModal] = useState(null)

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  useEffect(() => {
    loadInstallers()
  }, [selectedSpecialty, selectedDepartment])

  const loadInstallers = async () => {
    setLoading(true)

    try {
      let query = supabase
        .from('installers')
        .select('*')
        .eq('status', 'active')
        .order('subscription_type', { ascending: false }) // Premium en premier
        .order('rating', { ascending: false })

      if (selectedSpecialty && selectedSpecialty !== 'all') {
        query = query.contains('specialties', [selectedSpecialty])
      }

      if (selectedDepartment) {
        query = query.eq('department', selectedDepartment)
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setInstallers(data || [])

    } catch (err) {
      console.error('Erreur chargement installateurs:', err)
      // Données de démo si la table n'existe pas encore
      setInstallers(getDemoInstallers())
    } finally {
      setLoading(false)
    }
  }

  // Données de démonstration
  const getDemoInstallers = () => [
    {
      id: '1',
      company_name: 'DA Solutions Pro',
      city: 'Paris',
      department: '75',
      logo_url: null,
      description: 'Spécialiste de l\'installation et maintenance de distributeurs automatiques depuis 15 ans. Intervention rapide en Île-de-France.',
      specialties: ['food', 'beverage', 'fresh'],
      services: ['installation', 'maintenance', 'supply'],
      rating: 4.8,
      review_count: 47,
      subscription_type: 'premium',
      phone: '01 23 45 67 89',
      email: 'contact@dasolutions.fr',
      website: 'https://dasolutions.fr',
    },
    {
      id: '2',
      company_name: 'VendingTech',
      city: 'Lyon',
      department: '69',
      logo_url: null,
      description: 'Installation de distributeurs de boissons chaudes et snacking pour entreprises et collectivités.',
      specialties: ['beverage', 'food'],
      services: ['installation', 'rental', 'maintenance'],
      rating: 4.5,
      review_count: 32,
      subscription_type: 'standard',
      phone: '04 56 78 90 12',
      email: 'info@vendingtech.fr',
    },
    {
      id: '3',
      company_name: 'AutoDistrib',
      city: 'Marseille',
      department: '13',
      logo_url: null,
      description: 'Solutions complètes de distribution automatique alimentaire et non alimentaire.',
      specialties: ['food', 'non_food', 'custom'],
      services: ['sale', 'installation', 'supply'],
      rating: 4.2,
      review_count: 18,
      subscription_type: 'standard',
      phone: '04 91 23 45 67',
      email: 'contact@autodistrib.fr',
    },
  ]

  // Filtrer par recherche
  const filteredInstallers = installers.filter(installer => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      installer.company_name.toLowerCase().includes(query) ||
      installer.city?.toLowerCase().includes(query) ||
      installer.description?.toLowerCase().includes(query)
    )
  })

  // ============================================
  // HANDLERS
  // ============================================

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ q: searchQuery, specialty: selectedSpecialty })
  }

  const handleContact = (installer) => {
    setContactModal(installer)
  }

  const handleViewDetails = (installer) => {
    navigate(`/installer/${installer.id}`)
  }

  // ============================================
  // RENDU
  // ============================================

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="bg-primary text-white px-4 pt-6 pb-20">
        <h1 className="text-2xl font-bold mb-1">Installateurs partenaires</h1>
        <p className="text-white/80 text-sm">Trouvez un professionnel pour votre projet</p>
      </div>

      {/* ============================================ */}
      {/* BARRE DE RECHERCHE */}
      {/* ============================================ */}
      <div className="px-4 -mt-12">
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-3">
          <div className="flex items-center gap-2">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un installateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')}>
                <X size={18} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Filtres par département */}
          <div className="mt-3 pt-3 border-t flex items-center gap-2">
            <MapPin size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Département (ex: 75)"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="flex-1 outline-none text-sm"
              maxLength={3}
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${showFilters ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >
              <Filter size={16} />
            </button>
          </div>
        </form>

        {/* Filtres par spécialité */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {specialties.map((spec) => (
            <button
              key={spec.value}
              onClick={() => setSelectedSpecialty(spec.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedSpecialty === spec.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 shadow-sm'
              }`}
            >
              <span>{spec.icon}</span>
              <span>{spec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* RÉSULTATS */}
      {/* ============================================ */}
      <div className="px-4 mt-4">
        {/* Compteur */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600">
            {filteredInstallers.length} installateur{filteredInstallers.length > 1 ? 's' : ''} trouvé{filteredInstallers.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Recherche en cours...</p>
          </div>
        ) : filteredInstallers.length > 0 ? (
          <div className="space-y-4">
            {filteredInstallers.map((installer) => (
              <InstallerCard
                key={installer.id}
                installer={installer}
                onContact={handleContact}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <Wrench size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-700 mb-2">Aucun installateur trouvé</h3>
            <p className="text-gray-500 text-sm">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* CTA DEVENIR PARTENAIRE */}
      {/* ============================================ */}
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="font-bold">Vous êtes installateur ?</h3>
              <p className="text-sm text-white/70">Rejoignez notre réseau de partenaires</p>
            </div>
          </div>
          <ul className="space-y-2 mb-4 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" />
              Visibilité auprès de milliers d'utilisateurs
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" />
              Leads qualifiés directement dans votre boîte mail
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" />
              Badge "Partenaire vérifié" pour plus de confiance
            </li>
          </ul>
          <button
            onClick={() => navigate('/become-installer')}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold"
          >
            Devenir partenaire
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* MODAL CONTACT */}
      {/* ============================================ */}
      {contactModal && (
        <ContactModal
          installer={contactModal}
          onClose={() => setContactModal(null)}
          onSubmit={() => {}}
        />
      )}
    </div>
  )
}
