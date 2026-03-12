import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import Input from '../components/Input'
import Button from '../components/Button'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // Rediriger vers la page d'accueil après inscription
      navigate('/')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary px-6 py-8">
      <Logo size="md" />
      
      <h1 className="text-2xl font-bold text-accent-gray text-center mb-2">Créer un compte</h1>
      <p className="text-center text-accent-lightgray mb-8">
        Sauvegardez vos favoris et contribuez à la communauté.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4 mb-6">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="text-xs text-accent-lightgray -mt-2">6 caractères minimum</p>

        <Input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer mon compte'}
        </Button>
      </form>

      <div className="text-center">
        <span className="text-accent-gray">Vous avez </span>
        <button
          onClick={() => navigate('/login')}
          className="text-primary font-semibold underline"
        >
          déjà un compte ?
        </button>
        <br />
        <button
          onClick={() => navigate('/login')}
          className="text-primary underline mt-2"
        >
          Se connecter
        </button>
      </div>

      <p className="text-center text-xs text-accent-lightgray mt-8">
        En continuant, vous acceptez les CGU et la Politique de confidentialité.
      </p>
    </div>
  )
}
