import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ChevronLeft, Search, MapPin, Send } from 'lucide-react'

export default function OwnerClaim() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [step, setStep] = useState(1) // 1: recherche, 2: confirmation
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [justification, setJustification] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/login'); return }
      setUser(user)
    })
  }, [])

  const searchMachines = async (query) => {
    setSearchQuery(query)
    if (query.trim().length < 2) { setSuggestions([]); return }

    try {
      // Recherche dans les deux tables
      const [resManuel, resOSM] = await Promise.all([
        supabase.from('distributors').select('id, name, address, category, latitude, longitude')
          .ilike('name', `%${query}%`).limit(5),
        supabase.from('distributeurs').select('osm_id, nom, adresse, ville, latitude, longitude')
          .ilike('nom', `%${query}%`).limit(5),
      ])

      const manual = (resManuel.data || []).map(d => ({
        id: d.id,
        name: d.name || 'Distributeur automatique',
        address: d.address,
        latitude: d.latitude,
        longitude: d.longitude,
        source: 'manual',
      }))

      const osm = (resOSM.data || []).map(d => ({
        id: `osm-${d.osm_id}`,
        name: d.nom || 'Distributeur automatique',
        address: [d.adresse, d.ville].filter(Boolean).join(', ') || 'Adresse inconnue',
        latitude: d.latitude,
        longitude: d.longitude,
        source: 'osm',
      }))

      setSuggestions([...manual, ...osm])
    } catch (err) {
      console.error('Erreur recherche:', err)
    }
  }

  const handleSelectMachine = (machine) => {
    setSelectedMachine(machine)
    setSearchQuery(machine.name)
    setSuggestions([])
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!selectedMachine || !justification.trim()) return
    setSending(true)

    const { error } = await supabase.from('machine_ownership').insert({
      user_id: user.id,
      distributor_id: selectedMachine.id,
      distributor_name: selectedMachine.name,
      distributor_address: selectedMachine.address,
      justification: justification,
      status: 'pending',
    })

    setSending(false)
    if (!error) {
      setSent(true)
    } else if (error.code === '23505') {
      alert('Vous avez déjà une demande en cours pour cette machine.')
    } else {
      alert('Erreur : ' + error.message)
    }
  }

  if (sent) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm max-w-sm">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="text-xl font-bold mb-2">Demande envoyée !</h2>
        <p className="text-sm text-gray-500 mb-6">
          Notre équipe va vérifier votre demande et vous confirmer sous 48h.
        </p>
        <button onClick={() => navigate('/owner/dashboard')}
          className="w-full bg-primary text-white py-3 rounded-lg font-bold">
          Retour au tableau de bord
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <ChevronLeft size={16} /> Retour
        </button>
        <h1 className="text-2xl font-bold">Revendiquer une machine</h1>
        <p className="text-sm text-gray-500 mt-1">Associez votre machine à votre compte</p>
      </div>

      <div className="px-4 pt-6 space-y-4">

        {/* Étape 1 : Recherche */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
            Trouvez votre machine
          </h2>

          <div className="relative">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Nom ou adresse de la machine..."
                value={searchQuery}
                onChange={e => searchMachines(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>

            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map(machine => (
                  <button key={machine.id} onClick={() => handleSelectMachine(machine)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0">
                    <p className="font-medium text-sm">{machine.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-gray-400" />
                      <p className="text-xs text-gray-500">{machine.address}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedMachine && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-bold text-green-800">✅ {selectedMachine.name}</p>
              <p className="text-xs text-green-600">{selectedMachine.address}</p>
            </div>
          )}
        </div>

        {/* Étape 2 : Justification */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Justifiez votre propriété
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Expliquez pourquoi vous êtes le propriétaire de cette machine (ex: nom de société, numéro de série, date d'installation...).
            </p>
            <textarea
              value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="Je suis propriétaire de cette machine depuis... / Mon entreprise est..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
            />
          </div>
        )}

        {/* Bouton envoyer */}
        {step === 2 && (
          <button
            onClick={handleSubmit}
            disabled={sending || !justification.trim()}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Send size={16} />
            {sending ? 'Envoi en cours...' : 'ENVOYER MA DEMANDE'}
          </button>
        )}

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-700 font-medium mb-1">ℹ️ Comment ça marche ?</p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Vous soumettez une demande de revendication</li>
            <li>• Notre équipe vérifie sous 48h</li>
            <li>• Une fois validé, vous accédez aux stats de votre machine</li>
            <li>• Passez Pro pour booster la visibilité de vos machines</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
