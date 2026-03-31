import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Camera, Upload, Building2 } from 'lucide-react'
import Logo from '../components/Logo'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

export default function AddDistributor() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState(null) // null | 'report' | 'owner'
  const [loading, setLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [company, setCompany] = useState(null) // entreprise existante du proprio
  const [useExistingCompany, setUseExistingCompany] = useState(true)
  const [companyForm, setCompanyForm] = useState({
    name: '',
    description: '',
    contact: '',
  })

  // Formulaire utilisateur (signalement)
  const [reportForm, setReportForm] = useState({
    category: '',
    address: '',
    latitude: null,
    longitude: null,
    photo: null,
    comment: '',
    email: ''
  })

  // Doublon détecté
  const [doublonDetecte, setDoublonDetecte] = useState(null)

  // Formulaire propriétaire
  const [ownerForm, setOwnerForm] = useState({
    name: '',
    category: '',
    address: '',
    latitude: null,
    longitude: null,
    hours: '',
    products: '',
    payment_methods: '',
    photos: [],
    contact: '',
    description: ''
  })

  const categories = [
    { value: 'pain', label: 'Pain' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'burger', label: 'Burger' },
    { value: 'alimentaire', label: 'Alimentaire' },
    { value: 'fleurs', label: 'Fleurs' },
    { value: 'parapharmacie', label: 'Parapharmacie' },
    { value: 'autres', label: 'Autres' },
  ]

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        checkSubscriptionAndCompany(user.id)
      }
    })
  }, [])

  const checkSubscriptionAndCompany = async (userId) => {
    try {
      // Vérifier l'abonnement
      const { data: subData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .in('role', ['owner', 'admin'])
        .single()

      const subscribed = !!subData
      setIsSubscribed(subscribed)

      if (subscribed) {
        // Charger l'entreprise existante du proprio
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', userId)
          .single()

        if (companyData) {
          setCompany(companyData)
          setUseExistingCompany(true)
        } else {
          setUseExistingCompany(false)
        }
      }
    } catch (error) {
      // Pas abonné ou pas d'entreprise, on continue normalement
    }
  }

  const handleGeolocation = (formType) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          if (formType === 'report') {
            setReportForm(prev => ({ ...prev, latitude, longitude }))
          } else {
            setOwnerForm(prev => ({ ...prev, latitude, longitude }))
          }
        },
        () => {
          alert("Impossible d'obtenir votre position. Veuillez saisir l'adresse manuellement.")
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }
  }

  // Vérifier si un distributeur de MÊME CATÉGORIE existe déjà à proximité (rayon 50m)
  const verifierDoublon = async (lat, lng, category) => {
    if (!lat || !lng || !category) return null

    const delta = 0.0005 // ~50 mètres

    // Chercher dans distributor_reports (signalements) — même catégorie + même zone
    const { data: reports } = await supabase
      .from('distributor_reports')
      .select('id, address, status, category')
      .eq('category', category)
      .gte('latitude', lat - delta)
      .lte('latitude', lat + delta)
      .gte('longitude', lng - delta)
      .lte('longitude', lng + delta)
      .limit(1)

    if (reports && reports.length > 0) {
      const r = reports[0]
      const label = r.status === 'approved' ? 'validé' : r.status === 'pending' ? 'en attente de validation' : 'déjà signalé'
      return { source: 'signalement', label, address: r.address, category: r.category }
    }

    // Chercher dans distributors (machines validées) — même catégorie + même zone
    const { data: distributors } = await supabase
      .from('distributors')
      .select('id, name, address, status, category')
      .eq('category', category)
      .gte('latitude', lat - delta)
      .lte('latitude', lat + delta)
      .gte('longitude', lng - delta)
      .lte('longitude', lng + delta)
      .limit(1)

    if (distributors && distributors.length > 0) {
      const d = distributors[0]
      const label = d.status === 'approved' ? 'validé' : 'en attente de validation'
      return { source: 'machine', label, address: d.address, name: d.name, category: d.category }
    }

    return null
  }

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Vérifier doublon avant insertion
      const doublon = await verifierDoublon(reportForm.latitude, reportForm.longitude, reportForm.category)
      if (doublon && !doublonDetecte) {
        setDoublonDetecte(doublon)
        setLoading(false)
        return
      }
      setDoublonDetecte(null)

      const { error } = await supabase
        .from('distributor_reports')
        .insert([{
          category: reportForm.category,
          address: reportForm.address,
          latitude: reportForm.latitude,
          longitude: reportForm.longitude,
          comment: reportForm.comment,
          email: reportForm.email,
          report_type: 'new_machine',
          status: 'pending'
        }])
      if (error) throw error

      // Afficher message orienté abonnement
      alert('Merci pour votre signalement !\n\nSi vous êtes propriétaire de cette machine, rejoignez DA24.7 pour la gérer, accéder à ses statistiques et être alerté des problèmes signalés par vos clients.')
      navigate('/')
    } catch (error) {
      alert('Erreur lors du signalement : ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOwnerSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Vérifier doublon avant insertion
      const doublon = await verifierDoublon(ownerForm.latitude, ownerForm.longitude, ownerForm.category)
      if (doublon && !doublonDetecte) {
        setDoublonDetecte(doublon)
        setLoading(false)
        return
      }
      setDoublonDetecte(null)

      let companyId = null

      // Gestion de l'entreprise si abonné
      if (isSubscribed) {
        if (useExistingCompany && company) {
          companyId = company.id
        } else {
          // Créer une nouvelle entreprise
          const { data: newCompany, error: companyError } = await supabase
            .from('companies')
            .insert([{
              owner_id: user.id,
              name: companyForm.name,
              description: companyForm.description,
              contact: companyForm.contact,
              is_subscribed: true,
            }])
            .select()
            .single()
          if (companyError) throw companyError
          companyId = newCompany.id
        }
      }

      const { error } = await supabase
        .from('distributors')
        .insert([{
          name: ownerForm.name,
          category: ownerForm.category,
          address: ownerForm.address,
          latitude: ownerForm.latitude,
          longitude: ownerForm.longitude,
          hours: ownerForm.hours,
          products: ownerForm.products,
          payment_methods: ownerForm.payment_methods,
          contact: ownerForm.contact,
          description: ownerForm.description,
          owner_id: user.id,
          company_id: companyId,
          status: 'pending_verification'
        }])
      if (error) throw error
      alert('Machine ajoutée avec succès ! Elle sera vérifiée avant publication.')
      navigate('/')
    } catch (error) {
      alert("Erreur lors de l'ajout : " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // PAGE DE CHOIX
  // ============================================
  if (!mode) {
    return (
      <div className="min-h-screen bg-secondary px-6 py-8">
        <Logo size="lg" />
        <h1 className="text-3xl font-bold text-center mb-2 mt-8">Ajouter une machine</h1>
        <p className="text-center text-gray-600 mb-12">
          Choisissez comment vous souhaitez contribuer
        </p>
        <div className="space-y-4 max-w-md mx-auto">
          <button
            onClick={() => setMode('report')}
            className="w-full bg-white border-2 border-gray-300 rounded-xl p-6 hover:border-primary transition"
          >
            <div className="text-4xl mb-3">🔍</div>
            <h2 className="text-xl font-bold mb-2">Signaler une machine</h2>
            <p className="text-gray-600 text-sm">
              Vous avez repéré un distributeur ? Signalez-le rapidement sans créer de compte.
            </p>
          </button>

          <button
            onClick={() => {
              if (user) {
                setMode('owner')
              } else {
                navigate('/login')
              }
            }}
            className="w-full bg-primary text-white rounded-xl p-6 hover:bg-red-700 transition"
          >
            <div className="text-4xl mb-3">🏪</div>
            <h2 className="text-xl font-bold mb-2">Je suis propriétaire</h2>
            <p className="text-white text-sm">
              Ajoutez votre machine avec toutes les informations détaillées.
            </p>
            {!user && (
              <p className="text-white text-xs mt-2 opacity-90">(Connexion requise)</p>
            )}
          </button>
        </div>
        <button
          onClick={() => navigate('/')}
          className="block mx-auto mt-8 text-gray-600 underline"
        >
          Retour à l'accueil
        </button>
      </div>
    )
  }

  // ============================================
  // FORMULAIRE SIGNALEMENT
  // ============================================
  if (mode === 'report') {
    return (
      <div className="min-h-screen bg-secondary px-6 py-8 pb-24">
        <Logo size="lg" />
        <h1 className="text-3xl font-bold text-center mb-2 mt-8">Signaler une machine</h1>
        <p className="text-center text-gray-600 mb-8">
          Aidez la communauté en signalant un distributeur
        </p>
        <form onSubmit={handleReportSubmit} className="max-w-md mx-auto space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type de machine *</label>
            <select
              required
              value={reportForm.category}
              onChange={(e) => setReportForm({...reportForm, category: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Adresse *</label>
            <input
              type="text"
              required
              value={reportForm.address}
              onChange={(e) => setReportForm({...reportForm, address: e.target.value})}
              placeholder="12 rue de la Paix, 75001 Paris"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            />
            <button
              type="button"
              onClick={() => handleGeolocation('report')}
              className="mt-2 text-primary text-sm flex items-center gap-2"
            >
              <MapPin size={16} />
              Utiliser ma position actuelle
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Photo (optionnel)</label>
            <div className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg px-4 py-8 text-center">
              <Camera size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Ajoutez une photo du distributeur</p>
              <input type="file" accept="image/*" className="hidden" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Commentaire</label>
            <textarea
              value={reportForm.comment}
              onChange={(e) => setReportForm({...reportForm, comment: e.target.value})}
              placeholder="Informations supplémentaires..."
              rows="3"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email (optionnel)</label>
            <input
              type="email"
              value={reportForm.email}
              onChange={(e) => setReportForm({...reportForm, email: e.target.value})}
              placeholder="Pour être notifié de la validation"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          {/* Avertissement doublon */}
          {doublonDetecte && (
            <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-bold text-orange-800 mb-1">Distributeur déjà {doublonDetecte.label} !</p>
                  <p className="text-sm text-orange-700">
                    {doublonDetecte.name && <span className="font-medium">« {doublonDetecte.name} »</span>}
                    {doublonDetecte.address && <span> — {doublonDetecte.address}</span>}
                  </p>
                  <p className="text-xs text-orange-600 mt-2">Un distributeur existe déjà à moins de 50m. Voulez-vous quand même l'enregistrer ?</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setMode(null)}
              className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-3 font-bold"
            >
              Retour
            </button>
            <Button type="submit" disabled={loading} className="flex-1">
              {doublonDetecte
                ? (loading ? 'Envoi...' : 'Confirmer quand même')
                : (loading ? 'Envoi...' : 'Signaler')}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  // ============================================
  // FORMULAIRE PROPRIÉTAIRE
  // ============================================
  if (mode === 'owner') {
    return (
      <div className="min-h-screen bg-secondary px-6 py-8 pb-24">
        <Logo size="lg" />
        <h1 className="text-3xl font-bold text-center mb-2 mt-8">Ajouter ma machine</h1>
        <p className="text-center text-gray-600 mb-8">
          Renseignez les informations de votre distributeur
        </p>

        <form onSubmit={handleOwnerSubmit} className="max-w-md mx-auto space-y-4">

          {/* ---- SECTION ENTREPRISE (abonnés uniquement) ---- */}
          {isSubscribed && (
            <div className="bg-white border border-primary rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={18} className="text-primary" />
                <span className="font-semibold text-gray-800">Entreprise associée</span>
                <span className="ml-auto text-xs bg-primary text-white px-2 py-0.5 rounded-full">Abonné</span>
              </div>

              {company && (
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setUseExistingCompany(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition ${
                      useExistingCompany
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 text-gray-600'
                    }`}
                  >
                    Utiliser : {company.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseExistingCompany(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition ${
                      !useExistingCompany
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 text-gray-600'
                    }`}
                  >
                    Nouvelle entreprise
                  </button>
                </div>
              )}

              {(!company || !useExistingCompany) && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom de l'entreprise *</label>
                    <input
                      type="text"
                      required={isSubscribed && !useExistingCompany}
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                      placeholder="Ex : Boulangerie Dupont"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                      placeholder="Présentez votre entreprise en quelques mots..."
                      rows="2"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact</label>
                    <input
                      type="text"
                      value={companyForm.contact}
                      onChange={(e) => setCompanyForm({...companyForm, contact: e.target.value})}
                      placeholder="06 12 34 56 78 ou email@exemple.fr"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3">
                Le nom de votre entreprise sera affiché sur la fiche de chaque machine et permettra aux utilisateurs de voir toutes vos machines en un clic.
              </p>
            </div>
          )}

          {/* ---- INFOS MACHINE ---- */}
          <div>
            <label className="block text-sm font-medium mb-2">Nom de la machine *</label>
            <input
              type="text"
              required
              value={ownerForm.name}
              onChange={(e) => setOwnerForm({...ownerForm, name: e.target.value})}
              placeholder="Distributeur Pain Frais"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Catégorie *</label>
            <select
              required
              value={ownerForm.category}
              onChange={(e) => setOwnerForm({...ownerForm, category: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Adresse complète *</label>
            <input
              type="text"
              required
              value={ownerForm.address}
              onChange={(e) => setOwnerForm({...ownerForm, address: e.target.value})}
              placeholder="12 rue de la Paix, 75001 Paris"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            />
            <button
              type="button"
              onClick={() => handleGeolocation('owner')}
              className="mt-2 text-primary text-sm flex items-center gap-2"
            >
              <MapPin size={16} />
              Utiliser ma position actuelle
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Horaires d'accès *</label>
            <input
              type="text"
              required
              value={ownerForm.hours}
              onChange={(e) => setOwnerForm({...ownerForm, hours: e.target.value})}
              placeholder="24h/24 - 7j/7"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Produits disponibles *</label>
            <textarea
              required
              value={ownerForm.products}
              onChange={(e) => setOwnerForm({...ownerForm, products: e.target.value})}
              placeholder="Baguette, Pain complet, Croissants..."
              rows="3"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Moyens de paiement *</label>
            <input
              type="text"
              required
              value={ownerForm.payment_methods}
              onChange={(e) => setOwnerForm({...ownerForm, payment_methods: e.target.value})}
              placeholder="CB, Espèces, Sans contact"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contact *</label>
            <input
              type="text"
              required
              value={ownerForm.contact}
              onChange={(e) => setOwnerForm({...ownerForm, contact: e.target.value})}
              placeholder="06 12 34 56 78 ou email@exemple.fr"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={ownerForm.description}
              onChange={(e) => setOwnerForm({...ownerForm, description: e.target.value})}
              placeholder="Informations complémentaires sur votre machine..."
              rows="4"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Photos</label>
            <div className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg px-4 py-8 text-center">
              <Upload size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Ajoutez des photos de votre machine</p>
              <input type="file" accept="image/*" multiple className="hidden" />
            </div>
          </div>

          {/* Avertissement doublon */}
          {doublonDetecte && (
            <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-bold text-orange-800 mb-1">Distributeur déjà {doublonDetecte.label} !</p>
                  <p className="text-sm text-orange-700">
                    {doublonDetecte.name && <span className="font-medium">« {doublonDetecte.name} »</span>}
                    {doublonDetecte.address && <span> — {doublonDetecte.address}</span>}
                  </p>
                  <p className="text-xs text-orange-600 mt-2">Un distributeur existe déjà à moins de 50m. Voulez-vous quand même l'enregistrer ?</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setMode(null)}
              className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-3 font-bold"
            >
              Retour
            </button>
            <Button type="submit" disabled={loading} className="flex-1">
              {doublonDetecte
                ? (loading ? 'Ajout...' : 'Confirmer quand même')
                : (loading ? 'Ajout...' : 'Ajouter ma machine')}
            </Button>
          </div>
        </form>
      </div>
    )
  }
}
