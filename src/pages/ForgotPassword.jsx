import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      // Email envoyé avec succès
      navigate('/reset-confirmation')
    } catch (error) {
      setError(error.message || 'Erreur lors de l\'envoi de l\'email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary px-6 py-8 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      {/* Titre */}
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-2">
        Mot de passe oublié
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Indiquez votre adresse email pour réinitialiser votre mot de passe.
      </p>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6 mb-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition"
        />

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Envoi...' : 'Envoyer'}
        </Button>
      </form>

      {/* Lien retour */}
      <div className="text-center">
        <Link to="/login" className="text-primary underline font-medium">
          Retour à la connexion
        </Link>
      </div>

      {/* Footer CGU */}
      <div className="text-center text-xs text-gray-500 mt-auto">
        En continuant, vous acceptez les CGU et la Politique de confidentialité.
      </div>
    </div>
  )
}
