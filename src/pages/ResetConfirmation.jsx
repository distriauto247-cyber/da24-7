import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/Button'

export default function ResetConfirmation() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-secondary px-6 py-8 flex flex-col">
      {/* Logo */}
      <div className="mb-12">
        <Logo size="lg" />
      </div>

      {/* Titre */}
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-4">
        Email envoyé
      </h1>

      {/* Message */}
      <div className="text-center mb-8 space-y-4">
        <p className="text-gray-600">
          Un email de réinitialisation vous a été envoyé.
        </p>
        <p className="text-gray-600">
          Si vous ne voyez rien venir, vérifiez vos spams ou réessayez.
        </p>
      </div>

      {/* Bouton retour */}
      <Button onClick={() => navigate('/login')} className="w-full">
        Retour à la connexion
      </Button>

      {/* Footer CGU */}
      <div className="text-center text-xs text-gray-500 mt-auto">
        En continuant, vous acceptez les CGU et la Politique de confidentialité.
      </div>
    </div>
  )
}
