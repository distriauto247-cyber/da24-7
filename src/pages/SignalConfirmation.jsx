import { useNavigate } from 'react-router-dom'

export default function SignalConfirmation() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-6 pb-24">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="text-2xl font-bold mb-2">Merci !</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Votre signalement a bien été enregistré. Notre équipe va vérifier et ajouter cette machine à la carte DA24.7.
        </p>

        {/* Message propriétaire */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-bold text-primary mb-1">🤖 Vous êtes propriétaire de cette machine ?</p>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Votre machine est repérée ! Référencez-la sur DA24.7 pour la montrer au plus grand nombre, accéder à ses statistiques et être alerté des problèmes de vos clients.
          </p>
          <button
            onClick={() => navigate('/owner/gateway')}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-bold text-sm"
          >
            Référencer ma machine →
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 underline"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
