import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, CheckCircle, Clock, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../hooks/useAdmin'

export default function AdminUsers() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    notConfirmed: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  })
  const [recentUsers, setRecentUsers] = useState([])

  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

  const loadData = async () => {
    setLoading(true)
    try {
      // Note: On ne peut pas accéder directement à auth.users depuis le client
      // Il faudrait utiliser une fonction Edge ou l'API Admin
      // Pour l'instant, on fait des requêtes basiques
      
      // Compter via une requête RPC si disponible, sinon fallback
      const { data: usersData, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        console.error('Erreur chargement utilisateurs:', error)
        // Fallback: afficher message que les stats détaillées nécessitent l'API Admin
      } else {
        const users = usersData.users || []
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        setStats({
          total: users.length,
          confirmed: users.filter(u => u.email_confirmed_at).length,
          notConfirmed: users.filter(u => !u.email_confirmed_at).length,
          today: users.filter(u => new Date(u.created_at) >= today).length,
          thisWeek: users.filter(u => new Date(u.created_at) >= weekAgo).length,
          thisMonth: users.filter(u => new Date(u.created_at) >= monthAgo).length,
        })

        // 10 derniers utilisateurs
        setRecentUsers(
          users
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
        )
      }
    } catch (error) {
      console.error('Erreur:', error)
      // Les stats utilisateurs nécessitent l'accès Admin
      // Afficher un message à l'utilisateur
    } finally {
      setLoading(false)
    }
  }

  if (adminLoading || loading) {
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
    <div className="min-h-screen bg-secondary px-4 py-8 pb-24">
      {/* Header avec bouton retour */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-primary mb-4 hover:underline"
        >
          <ArrowLeft size={20} />
          Retour au tableau de bord
        </button>
        <h1 className="text-3xl font-bold text-center">Gestion des utilisateurs</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-gray-600 text-sm mb-1">Total</div>
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-gray-600 text-sm mb-1 flex items-center gap-1">
            <CheckCircle size={14} />
            Confirmés
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-gray-600 text-sm mb-1 flex items-center gap-1">
            <Clock size={14} />
            Non confirmés
          </div>
          <div className="text-3xl font-bold text-orange-600">{stats.notConfirmed}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-gray-600 text-sm mb-1">Aujourd'hui</div>
          <div className="text-2xl font-bold">{stats.today}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-gray-600 text-sm mb-1">Cette semaine</div>
          <div className="text-2xl font-bold">{stats.thisWeek}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-gray-600 text-sm mb-1">Ce mois</div>
          <div className="text-2xl font-bold">{stats.thisMonth}</div>
        </div>
      </div>

      {/* Note importante */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-yellow-800">
          ℹ️ <strong>Note :</strong> Pour accéder aux statistiques détaillées des utilisateurs, 
          l'application nécessite l'accès à l'API Admin de Supabase. 
          Pour le moment, consultez directement la section <strong>Authentication → Users</strong> dans le dashboard Supabase.
        </p>
      </div>

      {/* Derniers utilisateurs inscrits */}
      {recentUsers.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Derniers utilisateurs inscrits</h2>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div>
                  {user.email_confirmed_at ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Confirmé
                    </span>
                  ) : (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      Non confirmé
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lien Supabase */}
      <div className="mt-8 text-center">
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Ouvrir le dashboard Supabase →
        </a>
      </div>
    </div>
  )
}
