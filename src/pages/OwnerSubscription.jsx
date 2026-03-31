import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check, X } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    color: 'gray',
    description: 'Pour découvrir DA24.7',
    features: [
      { label: 'Machine listée sur la carte', included: true },
      { label: 'Marqueur standard', included: true },
      { label: 'Revendication de machine', included: true },
      { label: 'Statistiques de vues', included: false },
      { label: 'Marqueur pulsant visible', included: false },
      { label: 'Photos et description enrichie', included: false },
      { label: 'Alertes problèmes consommateurs', included: false },
      { label: 'Priorité d\'affichage', included: false },
    ]
  },
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: 9,
    color: 'blue',
    description: 'Pour gagner en visibilité',
    badge: null,
    features: [
      { label: 'Machine listée sur la carte', included: true },
      { label: 'Marqueur pulsant visible', included: true },
      { label: 'Statistiques complètes', included: true },
      { label: 'Photos et description enrichie', included: true },
      { label: 'Horaires détaillés', included: true },
      { label: 'Alertes problèmes consommateurs', included: false },
      { label: 'Priorité d\'affichage', included: false },
      { label: 'Support prioritaire', included: false },
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 24,
    color: 'red',
    description: 'Pour maximiser vos résultats',
    badge: 'Recommandé',
    features: [
      { label: 'Machine listée sur la carte', included: true },
      { label: 'Marqueur pulsant visible', included: true },
      { label: 'Statistiques complètes', included: true },
      { label: 'Photos et description enrichie', included: true },
      { label: 'Horaires détaillés', included: true },
      { label: 'Alertes problèmes consommateurs', included: true },
      { label: 'Priorité d\'affichage', included: true },
      { label: 'Support prioritaire', included: true },
    ]
  }
]

export default function OwnerSubscription() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('premium')
  const [showContact, setShowContact] = useState(false)

  const planColors = {
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600', btn: 'bg-gray-600 text-white', check: 'text-gray-400' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', btn: 'bg-blue-600 text-white', check: 'text-blue-500' },
    red: { bg: 'bg-red-50', border: 'border-primary', badge: 'bg-primary text-white', btn: 'bg-primary text-white', check: 'text-primary' },
  }

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <ChevronLeft size={16} /> Retour
        </button>
        <h1 className="text-2xl font-bold">Nos offres</h1>
        <p className="text-sm text-gray-500 mt-1">Choisissez l'offre adaptée à vos besoins</p>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Accroche */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed">
            DA24.7 compte déjà <strong>33 000+ machines</strong> référencées en France. 
            Chaque jour, de nouveaux utilisateurs cherchent une machine près de chez eux. 
            <strong> Votre machine est-elle visible au bon moment ?</strong>
          </p>
        </div>

        {/* Plans */}
        {PLANS.map(plan => {
          const colors = planColors[plan.color]
          const isSelected = selected === plan.id
          return (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`rounded-xl border-2 shadow-sm transition cursor-pointer ${
                isSelected ? `${colors.border} ${colors.bg}` : 'border-gray-200 bg-white'
              }`}
            >
              {/* En-tête du plan */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg">{plan.name}</h2>
                    {plan.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${colors.badge}`}>
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{plan.price === 0 ? 'Gratuit' : `${plan.price} €`}</span>
                    {plan.price > 0 && <span className="text-xs text-gray-400">/mois</span>}
                  </div>
                </div>
                <p className="text-xs text-gray-500">{plan.description}</p>
              </div>

              {/* Fonctionnalités */}
              <div className="px-4 pb-4 space-y-2">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {feature.included
                      ? <Check size={15} className={`flex-shrink-0 ${colors.check}`} />
                      : <X size={15} className="flex-shrink-0 text-gray-300" />
                    }
                    <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Bouton souscrire */}
        {selected !== 'free' && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            {!showContact ? (
              <>
                <p className="text-sm text-gray-600 mb-3 text-center">
                  Pour souscrire à l'offre <strong>{PLANS.find(p => p.id === selected)?.name}</strong>, contactez-nous directement.
                </p>
                <button
                  onClick={() => setShowContact(true)}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm"
                >
                  Je veux souscrire à cette offre
                </button>
              </>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm font-bold text-gray-700">Contactez-nous pour activer votre abonnement :</p>
                <a
                  href="mailto:distriauto24.7@gmail.com?subject=Abonnement DA24.7 - Offre Propriétaire&body=Bonjour, je souhaite souscrire à l'offre propriétaire DA24.7."
                  className="block w-full bg-primary text-white py-3 rounded-lg font-bold text-sm"
                >
                  ✉️ distriauto24.7@gmail.com
                </a>
                <p className="text-xs text-gray-400">Réponse sous 24h. Activation immédiate après paiement.</p>
                <button onClick={() => setShowContact(false)} className="text-xs text-gray-400 underline">Annuler</button>
              </div>
            )}
          </div>
        )}

        {/* FAQ rapide */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-sm">Questions fréquentes</h3>
          <div>
            <p className="text-xs font-semibold text-gray-700">Comment fonctionne l'abonnement ?</p>
            <p className="text-xs text-gray-500 mt-0.5">Abonnement mensuel sans engagement, résiliable à tout moment par email.</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Puis-je avoir plusieurs machines ?</p>
            <p className="text-xs text-gray-500 mt-0.5">Oui, l'abonnement s'applique par machine. Tarifs dégressifs pour les parcs importants.</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Que se passe-t-il si j'arrête ?</p>
            <p className="text-xs text-gray-500 mt-0.5">Votre machine reste listée gratuitement mais perd son marqueur pulsant et ses statistiques.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
