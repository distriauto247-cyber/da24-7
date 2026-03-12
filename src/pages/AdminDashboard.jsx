import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, MapPin, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../hooks/useAdmin'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    confirmedUsers: 0,
    newUsersToday: 0,
    totalDistributors: 0,
    activeDistributors: 0,
    pendingDistributors: 0,
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
  })

  useEffect(() => {
    if (isAdmin) {
      loadStats()
    }
  }, [isAdmin])

  const loadStats = async () => {
    setLoading(true)
    try {
      // Stats utilisateurs
      const { count: totalUsers } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true })

      // Stats distributeurs
      const { count: totalDistributors } = await supabase
        .from('distributors')
        .select('*', { count: 'exact', head: true })

      const { count: activeDistributors } = await supabase
        .from('distributors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: pendingDistributors } = await supabase
        .from('distributors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_verification')

      // Stats signalements
      const { count: totalReports } = await supabase
        .from('distributor_reports')
        .select('*', { count: 'exact', head: true })

      const { count: pendingReports } = await supabase
        .from('distributor_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { count: approvedReports } = await supabase
        .from('distributor_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

      const { count: rejectedReports } = await supabase
        .from('distributor_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected')

      setStats({
        totalUsers: totalUsers || 0,
        confirmedUsers: 0, // À calculer depuis auth.users
        newUsersToday: 0, // À calculer
        totalDistributors: totalDistributors || 0,
        activeDistributors: activeDistributors || 0,
        pendingDistributors: pendingDistributors || 0,
        totalReports: totalReports || 0,
        pendingReports: pendingReports || 0,
        approvedReports: approvedReports || 0,
        rejectedReports: rejectedReports || 0,
      })
    } catch (error) {
      console.error('Erreur chargement stats:', error)
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Tableau de bord Admin</h1>
        <p className="text-center text-gray-600">Vue d'ensemble de DA24.7</p>
      </div>

      {/* Bouton Rafraîchir */}
      <div className="flex justify-end mb-4">
        <button
          onClick={loadStats}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition"
        >
          <RefreshCw size={18} />
          <span className="text-sm">Rafraîchir</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {/* Utilisateurs */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
              <Users size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-bold">Utilisateurs</h3>
          </div>
          <div className="pl-11">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-3xl">{stats.totalUsers}</span>
            </div>
            <div className="text-sm text-gray-500">
              Nouveaux aujourd'hui : {stats.newUsersToday}
            </div>
          </div>
        </div>

        {/* Distributeurs */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
              <MapPin size={20} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold">Distributeurs</h3>
          </div>
          <div className="pl-11">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-3xl">{stats.totalDistributors}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-600">Actifs</span>
              <span className="font-medium">{stats.activeDistributors}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-600">En attente</span>
              <span className="font-medium">{stats.pendingDistributors}</span>
            </div>
          </div>
        </div>

        {/* Signalements */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
              <AlertCircle size={20} className="text-orange-600" />
            </div>
            <h3 className="text-lg font-bold">Signalements</h3>
          </div>
          <div className="pl-11">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-3xl">{stats.totalReports}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-orange-600">En attente</span>
              <span className="font-medium">{stats.pendingReports}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-600">Approuvés</span>
              <span className="font-medium">{stats.approvedReports}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-600">Rejetés</span>
              <span className="font-medium">{stats.rejectedReports}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold mb-4">Actions rapides</h2>

        {/* Gérer les signalements */}
        <button
          onClick={() => navigate('/admin/reports')}
          className="w-full bg-white rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertCircle size={24} className="text-orange-600" />
            </div>
            <div className="text-left">
              <div className="font-bold">Gérer les signalements</div>
              <div className="text-sm text-gray-600">
                {stats.pendingReports} en attente de validation
              </div>
            </div>
          </div>
          <ChevronRight size={24} className="text-gray-400" />
        </button>

        {/* Gérer les utilisateurs */}
        <button
          onClick={() => navigate('/admin/users')}
          className="w-full bg-white rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users size={24} className="text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-bold">Gérer les utilisateurs</div>
              <div className="text-sm text-gray-600">
                {stats.totalUsers} utilisateur{stats.totalUsers > 1 ? 's' : ''} inscrit{stats.totalUsers > 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <ChevronRight size={24} className="text-gray-400" />
        </button>
      </div>

      {/* Retour à l'accueil */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 underline"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
