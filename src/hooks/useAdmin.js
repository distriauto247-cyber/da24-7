import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function useAdmin() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        // Pas connecté → rediriger vers login
        navigate('/login')
        return
      }

      setUser(user)

      // Vérifier le rôle dans la table user_roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (roleError || !roleData || roleData.role !== 'admin') {
        // Pas admin → rediriger vers l'accueil avec message
        alert('⛔ Accès refusé : vous n\'avez pas les droits administrateur.')
        navigate('/')
        return
      }

      // L'utilisateur est admin ✅
      setIsAdmin(true)
    } catch (error) {
      console.error('Erreur vérification admin:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return { isAdmin, loading, user }
}
