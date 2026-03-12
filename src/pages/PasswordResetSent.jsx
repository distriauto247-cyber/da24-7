import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/Button'

export default function PasswordResetSent() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-secondary px-6 py-8 flex flex-col">
      <Logo size="md" />
      
      <h1 className="text-2xl font-bold text-accent-gray text-center mb-4">
        Email envoyé
      </h1>
      
      <p className="text-center text-accent-gray mb-4">
        Un email de réinitialisation vous a été envoyé.
      </p>

      <p className="text-center text-accent-lightgray mb-8">
        Si vous ne voyez rien venir, vérifiez vos spams ou réessayez.
      </p>

      <Button onClick={() => navigate('/login')}>
        Retour à la connexion
      </Button>

      <p className="text-center text-xs text-accent-lightgray mt-auto">
        En continuant, vous acceptez les CGU et la Politique de confidentialité.
      </p>
    </div>
  )
}
