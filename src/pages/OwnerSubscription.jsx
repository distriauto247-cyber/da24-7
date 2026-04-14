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
      { label: 'Marqueur coloré pulsant', included: false },
      { label: 'Statistiques de vues', included: false },
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
      { label: 'Marqueur coloré pulsant', included: true, note: 'Se démarque sur la carte' },
      { label: 'Statistiques complètes', included: true, note: 'Vues, itinéraires, favoris, partages' },
      { label: 'Photos, horaires, description', included: true },
      { label: 'Alertes problèmes consommateurs', included: false },
      { label: 'Priorité d\'affichage', included: false },
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 24,
    color: 'red',
    description: 'Visibilité maximale + gestion proactive',
    badge: 'Recommandé',
    features: [
      { label: 'Machine visible sur la carte', included: true },
      { label: 'Bouton Itinéraire', included: true },
      { label: 'Favoris & Partage utilisateurs', included: true },
      { label: 'Marqueur coloré pulsant', included: true },
      { label: 'Statistiques complètes', included: true },
      { label: 'Photos, horaires, description', included: true },
      { label: 'Alertes problèmes consommateurs', included: true, note: 'Panne, CB, produit non reçu...' },
      { label: 'Priorité d\'affichage', included: true, note: 'Apparaît avant les non-abonnés' },
    ]
  }
]

const ARGUMENTS = [
  { icon: '👁', title: 'Votre machine est déjà vue', desc: 'Des utilisateurs passent devant votre machine chaque jour. Sans abonnement, vous ne savez pas combien.' },
  { icon: '🔒', title: 'Favoris et partage bloqués', desc: 'Sur les machines non abonnées, les utilisateurs ne peuvent pas ajouter en favori ni partager. Vous perdez des clients réguliers.' },
  { icon: '📍', title: 'Marqueur gris = invisible', desc: 'Les machines abonnées pulsent en couleur sur la carte. Les vôtres sont grises. Le choix est vite fait pour l\'utilisateur.' },
  { icon: '⚠️', title: 'Problèmes non détectés', desc: 'Sans abonnement Premium, vous apprenez les pannes... quand vos clients se plaignent ailleurs.' },
]

export default function OwnerSubscription() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('essentiel')
  const [showContact, setShowContact] = useState(false)

  const planColors = {
    gray: { bg: 'bg-gray-50', border: 'border-gray-300', badge: 'bg-gray-100 text-gray-600', check: 'text-gray-400' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-400', badge: 'bg-blue-100 text-blue-700', check: 'text-blue-500' },
    red: { bg: 'bg-red-50', border: 'border-primary', badge: 'bg-primary text-white', check: 'text-primary' },
  }

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
          <p className="text-sm font-bold text-primary mb-1">Votre machine est déjà sur DA24.7</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Parmi les <strong>33 000+ distributeurs</strong> référencés en France, le vôtre apparaît en gris, sans info, sans photo. Les utilisateurs le voient... mais cliquent sur une machine concurrente mieux présentée.
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
                <p className="text-sm text-gray-600 mb-3 text-center">
                  Offre <strong>{PLANS.find(p => p.id === selected)?.name}</strong> — <strong>{PLANS.find(p => p.id === selected)?.price} €/mois</strong> sans engagement
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
                  href={`mailto:distriauto24.7@gmail.com?subject=Abonnement DA24.7 - Offre ${PLANS.find(p => p.id === selected)?.name}&body=Bonjour, je souhaite référencer ma machine avec l'offre ${PLANS.find(p => p.id === selected)?.name} à ${PLANS.find(p => p.id === selected)?.price}€/mois.`}
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
            { q: 'Puis-je avoir plusieurs machines ?', r: 'Oui, l\'abonnement s\'applique par machine. Tarifs dégressifs pour les parcs importants, contactez-nous.' },
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
