import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check, X } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    color: 'gray',
    description: 'Votre machine existe, mais personne ne la remarque',
    features: [
      { label: 'Machine visible sur la carte', included: true, note: 'Marqueur gris discret' },
      { label: 'Bouton Itinéraire', included: true },
      { label: 'Favoris & Partage utilisateurs', included: false },
      { label: 'Marqueur coloré et identifiable', included: false },
      { label: 'Statistiques complètes', included: false },
      { label: 'Photos, horaires, description', included: false },
      { label: 'Alertes problèmes consommateurs', included: false },
      { label: 'Priorité d\'affichage', included: false },
    ]
  },
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: 9,
    color: 'blue',
    description: 'Votre machine attire l\'œil et génère des visites',
    badge: null,
    features: [
      { label: 'Machine visible sur la carte', included: true },
      { label: 'Bouton Itinéraire', included: true },
      { label: 'Favoris & Partage utilisateurs', included: true, note: 'Vos clients peuvent sauvegarder' },
      { label: 'Marqueur coloré et identifiable', included: true, note: 'Icône colorée avec votre catégorie' },
      { label: 'Statistiques complètes', included: false },
      { label: 'Photos, horaires, description', included: true },
      { label: 'Alertes problèmes consommateurs', included: false },
      { label: 'Priorité d\'affichage', included: false },
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19,
    color: 'red',
    description: 'Visibilité maximale + gestion proactive',
    badge: 'Recommandé',
    features: [
      { label: 'Machine visible sur la carte', included: true },
      { label: 'Bouton Itinéraire', included: true },
      { label: 'Favoris & Partage utilisateurs', included: true, note: 'Vos clients peuvent sauvegarder' },
      { label: 'Marqueur coloré et identifiable', included: true },
      { label: 'Statistiques complètes', included: true, note: 'Vues, itinéraires, favoris, partages' },
      { label: 'Photos, horaires, description', included: true },
      { label: 'Alertes problèmes consommateurs', included: true, note: 'Panne, CB, produit non reçu...' },
      { label: 'Priorité d\'affichage', included: true, note: 'Apparaît avant les non-abonnés' },
    ]
  },
  {
    id: 'premium_plus',
    name: 'Premium +',
    price: 29,
    priceNote: 'pour 2 à 3 machines',
    extraPerMachine: 6,
    threshold: 3,
    color: 'purple',
    description: 'Pour les propriétaires de plusieurs machines',
    badge: 'Multi-machines',
    features: [
      { label: 'Machine visible sur la carte', included: true },
      { label: 'Bouton Itinéraire', included: true },
      { label: 'Favoris & Partage utilisateurs', included: true, note: 'Vos clients peuvent sauvegarder' },
      { label: 'Marqueur coloré et identifiable', included: true },
      { label: 'Statistiques complètes', included: true, note: 'Vues, itinéraires, favoris, partages' },
      { label: 'Photos, horaires, description', included: true },
      { label: 'Alertes problèmes consommateurs', included: true, note: 'Panne, CB, produit non reçu...' },
      { label: 'Priorité d\'affichage', included: true, note: 'Apparaît avant les non-abonnés' },
    ]
  }
]

const ARGUMENTS = [
  { icon: '🗺️', title: 'Votre machine n\'existe pas sur la carte', desc: 'Sans référencement, votre machine est invisible pour les milliers d\'utilisateurs qui cherchent un distributeur près de chez eux chaque jour.' },
  { icon: '🔒', title: 'Favoris et partage bloqués', desc: 'Seules les machines référencées peuvent être ajoutées en favori et partagées. Vos clients réguliers potentiels passent à côté.' },
  { icon: '📊', title: 'Vous ne savez pas ce que vous perdez', desc: 'Combien d\'utilisateurs cherchent une machine comme la vôtre dans votre quartier ? Sans abonnement, vous n\'aurez jamais cette réponse.' },
  { icon: '⚠️', title: 'Problèmes non détectés', desc: 'Sans abonnement Premium, vous apprenez les pannes... quand vos clients se plaignent ailleurs.' },
]

export default function OwnerSubscription() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('essentiel')
  const [showContact, setShowContact] = useState(false)
  const [machineCount, setMachineCount] = useState(2)

  const planColors = {
    gray: { bg: 'bg-gray-50', border: 'border-gray-300', badge: 'bg-gray-100 text-gray-600', check: 'text-gray-400' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-400', badge: 'bg-blue-100 text-blue-700', check: 'text-blue-500' },
    red: { bg: 'bg-red-50', border: 'border-primary', badge: 'bg-primary text-white', check: 'text-primary' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-400', badge: 'bg-purple-100 text-purple-700', check: 'text-purple-500' },
  }

  const selectedPlan = PLANS.find(p => p.id === selected)
  const computedPrice = selectedPlan
    ? (selectedPlan.id === 'premium_plus' && machineCount > selectedPlan.threshold
        ? selectedPlan.price + selectedPlan.extraPerMachine * (machineCount - selectedPlan.threshold)
        : selectedPlan.price)
    : 0

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <ChevronLeft size={16} /> Retour
        </button>
        <h1 className="text-2xl font-bold">Référencez votre machine</h1>
        <p className="text-sm text-gray-500 mt-1">Transformez votre machine invisible en machine incontournable</p>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Accroche choc */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm font-bold text-primary mb-1">Vos clients vous cherchent — trouvez-les !</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Chaque jour, des utilisateurs DA24.7 cherchent un distributeur près de chez eux. <strong>Sans référencement, votre machine n'apparaît pas.</strong> Référencez-la pour capter ce trafic qualifié.
          </p>
        </div>

        {/* Arguments visuels */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Ce que vous perdez sans abonnement</h2>
          {ARGUMENTS.map((arg, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{arg.icon}</span>
              <div>
                <p className="text-sm font-bold text-black">{arg.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{arg.desc}</p>
              </div>
            </div>
          ))}
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
                <p className="text-xs text-gray-500 italic">{plan.description}</p>
                {plan.priceNote && (
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    {plan.price} € {plan.priceNote} · +{plan.extraPerMachine} €/machine au-delà de {plan.threshold}
                  </p>
                )}
              </div>

              <div className="px-4 pb-4 space-y-2">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {feature.included
                      ? <Check size={15} className={`flex-shrink-0 mt-0.5 ${colors.check}`} />
                      : <X size={15} className="flex-shrink-0 mt-0.5 text-gray-300" />
                    }
                    <div>
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.label}
                      </span>
                      {feature.note && feature.included && (
                        <p className="text-xs text-gray-400">{feature.note}</p>
                      )}
                    </div>
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
                {selected === 'premium_plus' && (
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-600 block mb-2 text-center">Nombre de machines</label>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => setMachineCount(m => Math.max(2, m - 1))}
                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold"
                      >
                        −
                      </button>
                      <span className="text-lg font-bold w-6 text-center">{machineCount}</span>
                      <button
                        type="button"
                        onClick={() => setMachineCount(m => m + 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-600 mb-3 text-center">
                  Offre <strong>{selectedPlan?.name}</strong> — <strong>{computedPrice} €/mois</strong> sans engagement
                  {selected === 'premium_plus' && (
                    <span className="block text-xs text-gray-400 mt-1">
                      pour {machineCount} machine{machineCount > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => setShowContact(true)}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm"
                >
                  Je veux référencer ma machine
                </button>
              </>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm font-bold text-gray-700">Contactez-nous pour activer votre abonnement :</p>
                <a
                  href={`mailto:distriauto24.7@gmail.com?subject=${encodeURIComponent(`Abonnement DA24.7 - Offre ${selectedPlan?.name}`)}&body=${encodeURIComponent(
                    selected === 'premium_plus'
                      ? `Bonjour, je souhaite référencer ${machineCount} machines avec l'offre ${selectedPlan?.name} (${computedPrice}€/mois pour ${machineCount} machines).`
                      : `Bonjour, je souhaite référencer ma machine avec l'offre ${selectedPlan?.name} à ${selectedPlan?.price}€/mois.`
                  )}`}
                  className="block w-full bg-primary text-white py-3 rounded-lg font-bold text-sm"
                >
                  ✉️ distriauto24.7@gmail.com
                </a>
                <p className="text-xs text-gray-400">Réponse sous 24h · Activation immédiate après paiement</p>
                <button onClick={() => setShowContact(false)} className="text-xs text-gray-400 underline">Annuler</button>
              </div>
            )}
          </div>
        )}

        {/* FAQ */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-sm">Questions fréquentes</h3>
          {[
            { q: 'Comment fonctionne l\'abonnement ?', r: 'Mensuel sans engagement, résiliable à tout moment par email.' },
            { q: 'Puis-je avoir plusieurs machines ?', r: 'Oui, l\'abonnement s\'applique par machine. Pour 2 à 3 machines, l\'offre Premium + est à 29€/mois, puis +6€/mois par machine supplémentaire au-delà de 3.' },
            { q: 'Que se passe-t-il si j\'arrête ?', r: 'Votre machine reste listée gratuitement en marqueur gris. Vous perdez la visibilité, les stats et les alertes.' },
            { q: 'Ma machine est-elle déjà référencée ?', r: 'Très probablement oui — nous avons 33 000+ machines. Cherchez-la sur la carte DA24.7.' },
          ].map((item, i) => (
            <div key={i}>
              <p className="text-xs font-semibold text-gray-700">{item.q}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.r}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
