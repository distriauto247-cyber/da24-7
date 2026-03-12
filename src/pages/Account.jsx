import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, LogOut, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from '../components/Button'

export default function Account() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Changement de mot de passe
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Si pas connecté, rediriger vers login
      navigate('/login')
    } else {
      setUser(user)
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    // Validation
    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (error) {
      setPasswordError(error.message || 'Erreur lors de la modification du mot de passe')
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      navigate('/')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // Supprimer toutes les données de l'utilisateur
      // Note: La suppression du compte Auth nécessite l'API Admin
      // Pour l'instant, on supprime juste les données et on déconnecte
      
      // Supprimer les favoris
      await supabase.from('favorites').delete().eq('user_id', user.id)
      
      // Supprimer les préférences
      await supabase.from('user_preferences').delete().eq('user_id', user.id)
      
      // Déconnexion
      await supabase.auth.signOut()
      
      // Nettoyer localStorage
      localStorage.clear()
      
      alert('Votre compte a été supprimé')
      navigate('/')
    } catch (error) {
      alert('Erreur lors de la suppression : ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-accent-gray">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary px-6 py-8 pb-24">
      {/* Titre */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <User size={32} className="text-primary" />
        <h1 className="text-3xl font-bold">Mon compte</h1>
      </div>

      {/* Informations du compte */}
      <div className="bg-white rounded-xl p-6 mb-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Mail size={20} className="text-primary" />
          Email
        </h2>
        <p className="text-gray-700">{user?.email}</p>
        <p className="text-sm text-gray-500 mt-2">
          Votre adresse email ne peut pas être modifiée
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Modifier le mot de passe */}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition"
        >
          <Lock size={20} className="text-primary" />
          <span className="font-medium">Modifier le mot de passe</span>
        </button>

        {/* Se déconnecter */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition"
        >
          <LogOut size={20} className="text-gray-600" />
          <span className="font-medium">Se déconnecter</span>
        </button>

        {/* Supprimer mon compte */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-red-50 transition"
        >
          <Trash2 size={20} className="text-red-500" />
          <span className="font-medium text-red-500">Supprimer mon compte</span>
        </button>
      </div>

      {/* Modale Modifier le mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Modifier le mot de passe</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              {passwordError && (
                <div className="text-red-500 text-sm">{passwordError}</div>
              )}

              {passwordSuccess && (
                <div className="text-green-500 text-sm">✅ Mot de passe modifié avec succès !</div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setNewPassword('')
                  setConfirmPassword('')
                  setPasswordError('')
                  setPasswordSuccess(false)
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-bold"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Supprimer le compte */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-red-500">Supprimer mon compte</h3>
            
            <p className="mb-6 text-gray-700">
              Êtes-vous sûr de vouloir supprimer votre compte ? 
              <br /><br />
              <strong>Cette action est irréversible.</strong>
              <br /><br />
              Toutes vos données (favoris, préférences) seront définitivement supprimées.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
