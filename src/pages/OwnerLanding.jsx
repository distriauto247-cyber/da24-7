import { useNavigate, useSearchParams } from 'react-router-dom'
import { LogIn, Check } from 'lucide-react'

export default function OwnerLanding() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const machineAddress = searchParams.get('address') || 'votre machine'
  const machineCategory = searchParams.get('category') || ''

  const BENEFITS = [
    { icon: '📍', text: 'Votre machine visible et identifiable sur la carte' },
    { icon: '📊', text: 'Statistiques : vues, itinéraires, favoris, partages' },
    { icon: '⭐', text: 'Notation par les utilisateurs — valorisez votre machine' },
    { icon: '🔒', text: 'Favoris et partage débloqués pour vos clients' },
    { icon: '⚠️', text: 'Alertes en temps réel des problèmes signalés (Premium)' },
    { icon: '🚀', text: 'Priorité d\'affichage sur la carte (Premium)' },
  ]

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-primary px-6 pt-10 pb-8 text-center text-white">
        <p className="text-4xl mb-3">🤖</p>
        <h1 className="text-2xl font-bold mb-2">Votre machine est repérée !</h1>
        <p className="text-sm opacity-90 leading-relaxed">
          Un utilisateur DA24.7 vient de signaler {machineAddress && `une machine ${machineCategory ? `(${machineCategory})` : ''} à l'adresse :`}
        </p>
        {machineAddress && (
          <p className="text-sm font-bold mt-1 bg-white/20 rounded-lg px-3 py-2 mt-3">
            📍 {machineAddress}
          </p>
        )}
      </div>

      <div className="px-4 pt-5 space-y-4">

        {/* Problème actuel */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wide">Sans abonnement, votre machine :</h2>
          <div className="space-y-2">
            {[
              'Apparaît en gris, sans info ni photo',
              'Ne peut pas être ajoutée en favori',
              'Ne peut pas être partagée',
              'Vous ne savez pas combien de personnes la cherchent',
              'Vous n\'êtes pas alerté des pannes ou problèmes',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-400 text-sm flex-shrink-0 mt-0.5">✗</span>
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bénéfices abonnement */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wide">Avec DA24.7, votre machine :</h2>
          <div className="space-y-2">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{b.icon}</span>
                <span className="text-sm text-gray-700">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tarif */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">À partir de 9 €/mois</p>
          <p className="text-xs text-gray-500 mt-1">Sans engagement · Résiliable à tout moment</p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/owner/gateway')}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-sm"
        >
          <LogIn size={20} />
          Je référence ma machine maintenant
        </button>

        <button
          onClick={() => navigate('/owner/subscription')}
          className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium"
        >
          Voir les offres détaillées
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full text-center text-xs text-gray-400 underline pb-4"
        >
          Non merci, retour à l'accueil
        </button>
      </div>
    </div>
  )
}
