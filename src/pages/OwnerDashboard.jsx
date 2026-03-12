import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, Eye, Heart, MapPin, TrendingUp, AlertCircle, 
  Edit, Trash2, MoreVertical, ChevronRight, BarChart3,
  Users, Calendar, CheckCircle, Clock, XCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from '../components/Button'

// Configuration des catégories
const categoryConfig = {
  pain: { emoji: '🥖', label: 'Pain', color: '#D4A574' },
  pizza: { emoji: '🍕', label: 'Pizza', color: '#E74C3C' },
  burger: { emoji: '🍔', label: 'Burger', color: '#F39C12' },
  alimentaire: { emoji: '🛒', label: 'Alimentaire', color: '#27AE60' },
  fleurs: { emoji: '💐', label: 'Fleurs', color: '#E91E63' },
  parapharmacie: { emoji: '💊', label: 'Pharma', color: '#3498DB' },
  autres: { emoji: '🏪', label: 'Autres', color: '#9B59B6' },
}

// Composant StatCard
function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center`}>
          <Icon size={20} className={`text-${color}`} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

// Composant DistributorCard pour le dashboard
function OwnerDistributorCard({ distributor, onEdit, onDelete, onViewStats }) {
  const [showMenu, setShowMenu] = useState(false)
  const category = categoryConfig[distributor.category] || categoryConfig.autres

  const statusConfig = {
    active: { label: 'Actif', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    pending_verification: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    inactive: { label: 'Inactif', color: 'bg-gray-100 text-gray-700', icon: XCircle },
    reported: { label: 'Signalé', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  }

  const status = statusConfig[distributor.status] || statusConfig.active
  const StatusIcon = status.icon

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex">
        {/* Image */}
        <div 
          className="w-24 h-24 flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: category.color + '20' }}
        >
          {distributor.photo_url ? (
            <img src={distributor.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">{category.emoji}</span>
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 line-clamp-1">{distributor.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-1">{distributor.address}</p>
            </div>
            
            {/* Menu actions */}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MoreVertical size={18} className="text-gray-400" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[140px]">
                  <button
                    onClick={() => { setShowMenu(false); onEdit(distributor); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={14} /> Modifier
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onViewStats(distributor); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <BarChart3 size={14} /> Statistiques
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onDelete(distributor); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats rapides */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye size={12} />
              <span>{distributor.view_count || 0} vues</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Heart size={12} />
              <span>{distributor.favorite_count || 0}</span>
            </div>
          </div>

          {/* Statut */}
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.color}`}>
              <StatusIcon size={10} />
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant principal
export default function OwnerDashboard() {
  const navigate = useNavigate()
  
  // États
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [distributors, setDistributors] = useState([])
  const [stats, setStats] = useState({
    totalViews: 0,
    totalFavorites: 0,
    totalDistributors: 0,
    pendingReports: 0,
  })
  const [period, setPeriod] = useState('month') // 'week', 'month', 'year'
  
  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      loadOwnerData()
    }
  }, [user])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      navigate('/login')
      return
    }
    
    setUser(user)
  }

  const loadOwnerData = async () => {
    setLoading(true)
    
    try {
      // Charger les distributeurs du propriétaire
      const { data: distributorData, error } = await supabase
        .from('distributors')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setDistributors(distributorData || [])

      // Calculer les stats
      const totalViews = (distributorData || []).reduce((sum, d) => sum + (d.view_count || 0), 0)
      const totalFavorites = (distributorData || []).reduce((sum, d) => sum + (d.favorite_count || 0), 0)

      // Compter les signalements en attente
      const { count: pendingReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .in('distributor_id', (distributorData || []).map(d => d.id))
        .eq('status', 'pending')

      setStats({
        totalViews,
        totalFavorites,
        totalDistributors: distributorData?.length || 0,
        pendingReports: pendingReports || 0,
      })

    } catch (err) {
      console.error('Erreur chargement données:', err)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // ACTIONS
  // ============================================

  const handleAddDistributor = () => {
    navigate('/add-distributor')
  }

  const handleEditDistributor = (distributor) => {
    navigate(`/edit-distributor/${distributor.id}`)
  }

  const handleDeleteDistributor = async (distributor) => {
    if (!confirm(`Supprimer "${distributor.name}" ?`)) return

    try {
      const { error } = await supabase
        .from('distributors')
        .delete()
        .eq('id', distributor.id)
        .eq('owner_id', user.id) // Sécurité

      if (error) throw error

      setDistributors(distributors.filter(d => d.id !== distributor.id))
      alert('Distributeur supprimé')
    } catch (err) {
      console.error('Erreur suppression:', err)
      alert('Erreur lors de la suppression')
    }
  }

  const handleViewStats = (distributor) => {
    navigate(`/distributor-stats/${distributor.id}`)
  }

  // ============================================
  // RENDU
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-accent-gray">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="bg-primary text-white px-4 pt-6 pb-8">
        <h1 className="text-2xl font-bold mb-1">Mon espace propriétaire</h1>
        <p className="text-white/80 text-sm">Gérez vos distributeurs et suivez vos statistiques</p>
      </div>

      {/* ============================================ */}
      {/* STATS CARDS */}
      {/* ============================================ */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            icon={MapPin} 
            label="Mes machines" 
            value={stats.totalDistributors}
            color="primary"
          />
          <StatCard 
            icon={Eye} 
            label="Vues totales" 
            value={stats.totalViews}
            trend={12}
            color="blue-500"
          />
          <StatCard 
            icon={Heart} 
            label="En favoris" 
            value={stats.totalFavorites}
            trend={8}
            color="pink-500"
          />
          <StatCard 
            icon={AlertCircle} 
            label="Signalements" 
            value={stats.pendingReports}
            color="orange-500"
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* GRAPHIQUE (placeholder) */}
      {/* ============================================ */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Activité</h2>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-sm border rounded-lg px-2 py-1"
            >
              <option value="week">7 jours</option>
              <option value="month">30 jours</option>
              <option value="year">12 mois</option>
            </select>
          </div>
          
          {/* Placeholder graphique */}
          <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <BarChart3 size={32} className="mx-auto mb-2" />
              <p className="text-sm">Graphique des vues</p>
              <p className="text-xs">Bientôt disponible</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* LISTE DES DISTRIBUTEURS */}
      {/* ============================================ */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Mes distributeurs</h2>
          <button
            onClick={handleAddDistributor}
            className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>

        {distributors.length > 0 ? (
          <div className="space-y-3">
            {distributors.map((distributor) => (
              <OwnerDistributorCard
                key={distributor.id}
                distributor={distributor}
                onEdit={handleEditDistributor}
                onDelete={handleDeleteDistributor}
                onViewStats={handleViewStats}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="font-bold text-gray-800 mb-2">Aucun distributeur</h3>
            <p className="text-gray-500 text-sm mb-4">
              Ajoutez votre premier distributeur pour commencer
            </p>
            <Button onClick={handleAddDistributor}>
              <Plus size={18} className="mr-2" />
              Ajouter une machine
            </Button>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* SECTION AIDE / UPGRADE */}
      {/* ============================================ */}
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-r from-primary to-red-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Boostez votre visibilité</h3>
              <p className="text-sm text-white/80">Passez en Premium pour apparaître en priorité</p>
            </div>
            <ChevronRight size={20} />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* LIENS RAPIDES */}
      {/* ============================================ */}
      <div className="px-4 mt-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-3">Liens rapides</h2>
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/owner-reports')}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-orange-500" />
              <span className="text-gray-700">Signalements reçus</span>
            </div>
            {stats.pendingReports > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.pendingReports}
              </span>
            )}
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <button 
            onClick={() => navigate('/owner-settings')}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Users size={20} className="text-blue-500" />
              <span className="text-gray-700">Mon profil commerçant</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <button 
            onClick={() => window.open('mailto:distriauto24.7@gmail.com')}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-green-500" />
              <span className="text-gray-700">Contacter le support</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
