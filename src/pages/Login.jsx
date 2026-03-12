import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '../components/Logo'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Connexion réussie
      navigate('/')
    } catch (error) {
      setError(error.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueWithoutAccount = () => {
    // Continuer sans compte - redirection vers l'accueil
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-secondary px-6 py-8 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      {/* Titre */}
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-2">Connexion</h1>
      <p className="text-center text-gray-600 mb-8">
        Accédez à vos favoris et contribuez à la communauté.
      </p>

      {/* Formulaire Email/Password */}
      <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
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

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      {/* Liens */}
      <div className="text-center space-y-3 mb-8">
        <Link to="/register" className="text-primary underline font-medium block">
          Créer un compte
        </Link>
        <Link to="/forgot-password" className="text-primary underline font-medium block">
          Mot de passe oublié
        </Link>
      </div>

      {/* Continuer sans compte */}
      <div className="text-center mt-8">
        <button
          onClick={handleContinueWithoutAccount}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold mb-2 hover:bg-gray-200 transition"
        >
          Continuer sans compte
        </button>
        <p className="text-xs text-gray-500">
          Les favoris et contributions ne seront pas sauvegardés.
        </p>
      </div>

      {/* Footer CGU */}
      <div className="text-center text-xs text-gray-500 mt-8">
        En continuant, vous acceptez les CGU et la Politique de confidentialité.
      </div>
    </div>
  )
}
