import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

export default function AppVersion() {
  const navigate = useNavigate()

  const versions = [
    {
      version: '1.3.0',
      date: '12/03/2026',
      type: 'MAJEURE',
      typeColor: 'bg-red-500',
      features: [
        { icon: '✅', title: 'Nouveautés', items: [
          'Produits disponibles par distributeur',
          'Filtres par type de machine'
        ]},
        { icon: '🔧', title: 'Améliorations', items: [
          'Carte plus rapide au chargement',
          'Fiches distributeurs plus lisibles',
          'Fiches distributeurs plus lisibles'
        ]},
        { icon: '🐛', title: 'Corrections', items: [
          'Bug de géolocalisation Android',
          'Crash au démarrage corrigé'
        ]}
      ]
    },
    {
      version: '1.2.1',
      date: '02/02/2026',
      type: 'CORRECTIVE',
      typeColor: 'bg-gray-500',
      features: [
        { icon: '🐛', title: 'Corrections', items: [
          'Problème d\'afffichage des favoris',
          'Correction d\'un plantage ponctuel'
        ]}
      ]
    },
    {
      version: '1.2.0',
      date: '15/01/2026',
      type: 'MINEURE',
      typeColor: 'bg-orange-500',
      features: [
        { icon: '🔧', title: 'Améliorations', items: [
          'Navigation plus fluide',
          'Optimisation du temps de recherche'
        ]}
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-secondary pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <RefreshCw size={24} className="text-primary" />
            <h1 className="text-xl font-bold">Versions de l'application</h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="text-center text-accent-gray mb-6">
          Historique des mises à jour DA24.7
        </p>

        {/* Version list */}
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div
              key={version.version}
              className={`bg-white rounded-lg p-4 border-l-4 ${
                index === 0 ? 'border-primary' : 'border-gray-300'
              }`}
            >
              {/* Version header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold">Version {version.version}</h3>
                  <p className="text-sm text-accent-lightgray">{version.date}</p>
                </div>
                <span className={`${version.typeColor} text-white text-xs font-bold px-3 py-1 rounded`}>
                  {version.type}
                </span>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {version.features.map((feature, fIndex) => (
                  <div key={fIndex}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{feature.icon}</span>
                      <h4 className="font-semibold">{feature.title}</h4>
                    </div>
                    <ul className="ml-8 space-y-1">
                      {feature.items.map((item, iIndex) => (
                        <li key={iIndex} className="text-sm text-accent-gray flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Current version */}
        <div className="mt-6 text-center">
          <p className="text-accent-gray mb-4">Version installée : 1.3.0</p>
          <Button onClick={() => navigate('/report-problem/app')}>
            Signaler un problème
          </Button>
        </div>
      </div>
    </div>
  )
}
