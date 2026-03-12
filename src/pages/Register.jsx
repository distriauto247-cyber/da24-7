import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '../components/Logo'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // Compte créé avec succès
      alert('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
      navigate('/login')
    } catch (error) {
      setError(error.message || 'Erreur lors de la création du compte')
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
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-2">Créer un compte</h1>
      <p className="text-center text-gray-600 mb-8">
        Sauvegardez vos favoris et contribuez à la communauté.
      </p>

      {/* Formulaire */}
      <form onSubmit={handleRegister} className="space-y-4 mb-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition"
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-primary transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <p className="text-sm text-gray-600">6 caractères minimum</p>

        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-primary transition"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Création...' : 'Créer mon compte'}
        </Button>
      </form>

      {/* Lien connexion */}
      <div className="text-center">
        <p className="text-gray-700">
          Vous avez <span className="font-medium">déjà un compte</span> ?
        </p>
        <Link to="/login" className="text-primary underline font-medium">
          Se connecter
        </Link>
      </div>

      {/* Footer CGU */}
      <div className="text-center text-xs text-gray-500 mt-auto">
        En continuant, vous acceptez les CGU et la Politique de confidentialité.
      </div>
    </div>
  )
}
