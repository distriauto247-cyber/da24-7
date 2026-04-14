import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ChevronRight, LogIn, PlusCircle } from 'lucide-react'
import iconProprietaire from '../assets/icons/proprietaire.png'

export default function OwnerGateway() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [hasMachines, setHasMachines] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)

      if (user) {
        // Vérifier si l'utilisateur a des machines revendiquées
        const { data } = await supabase
          .from('machine_ownership')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        if (data && data.length > 0) {
          // Connecté + machines → tableau de bord direct
          navigate('/owner/dashboard', { replace: true })
          return
        }
        setHasMachines(false)
      }

      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  // Connecté mais sans machine → revendiquer
  if (user && !hasMachines) return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm w-full max-w-sm">
        <img src={iconProprietaire} alt="Propriétaire" className="w-20 h-20 object-contain mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Bienvenue !</h2>
        <p className="text-sm text-gray-500 mb-6">
          Vous n'avez pas encore de machine enregistrée. Revendiquez votre première machine pour accéder à vos statistiques et gérer votre visibilité.
        </p>
        <button
          onClick={() => navigate('/owner/claim')}
          className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm mb-3 flex items-center justify-center gap-2"
        >
          <PlusCircle size={18} />
          Revendiquer ma machine
        </button>
        <button
          onClick={() => navigate('/owner/subscription')}
          className="w-full border border-gray-200 text-gray-600 py-3 rounded-lg text-sm"
        >
          Voir les offres d'abonnement
        </button>
      </div>
    </div>
  )

  // Non connecté → page d'accueil propriétaire
  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-6 shadow-sm text-center">
        <img src={iconProprietaire} alt="Propriétaire" className="w-20 h-20 object-contain mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Espace Propriétaire</h1>
        <p className="text-sm text-gray-500 mt-2">
          Gérez vos machines, suivez vos statistiques et boostez votre visibilité
        </p>
      </div>

      <div className="px-4 pt-6 space-y-4">

        {/* Avantages */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Pourquoi rejoindre DA24.7 ?</h2>
          {[
            { icon: '📊', title: 'Statistiques en temps réel', desc: 'Vues, itinéraires, favoris, partages — sachez combien de clients passent devant votre machine' },
            { icon: '🎨', title: 'Marqueur coloré et identifiable', desc: 'Votre machine se distingue des machines grises anonymes sur la carte' },
            { icon: '🔒', title: 'Favoris & partage débloqués', desc: 'Les utilisateurs peuvent sauvegarder et partager votre machine — vos clients reviennent' },
            { icon: '⚠️', title: 'Alertes consommateurs (Premium)', desc: 'Soyez notifié en temps réel des problèmes signalés sur vos machines' },
            { icon: '🚀', title: 'Priorité d\'affichage', desc: 'Votre machine apparaît avant les machines non référencées' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-bold text-black">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA connexion */}
        <button
          onClick={() => navigate('/login?redirect=/owner/gateway')}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-sm"
        >
          <LogIn size={20} />
          Je me connecte / m'inscris
        </button>

        {/* Voir les offres */}
        <button
          onClick={() => navigate('/owner/subscription')}
          className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
        >
          Découvrir les offres
          <ChevronRight size={16} />
        </button>

        {/* Info tarif */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-sm font-bold text-primary">À partir de 9 €/mois</p>
          <p className="text-xs text-gray-500 mt-1">Sans engagement · Résiliable à tout moment</p>
        </div>
      </div>
    </div>
  )
}
