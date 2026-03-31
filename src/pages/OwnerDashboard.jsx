import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ChevronLeft, Eye, Navigation, Heart, Share2, TrendingUp, Plus } from 'lucide-react'

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [machines, setMachines] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [pendingClaims, setPendingClaims] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/login'); return }
      setUser(user)
      loadData(user.id)
    })
  }, [])

  const loadData = async (userId) => {
    // Charger les revendications approuvées
    const { data: ownership } = await supabase
      .from('machine_ownership')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    const approved = (ownership || []).filter(o => o.status === 'approved')
    const pending = (ownership || []).filter(o => o.status !== 'approved')

    setMachines(approved)
    setPendingClaims(pending)

    // Charger les stats pour les machines approuvées
    if (approved.length > 0) {
      const ids = approved.map(o => o.distributor_id)
      const { data: statsData } = await supabase.rpc('get_machine_stats', { machine_ids: ids })
      if (statsData) {
        const statsMap = {}
        statsData.forEach(s => { statsMap[s.distributor_id] = s })
        setStats(statsMap)
      }
    }

    setLoading(false)
  }

  const totalViews = Object.values(stats).reduce((sum, s) => sum + Number(s.total_views || 0), 0)
  const totalItineraries = Object.values(stats).reduce((sum, s) => sum + Number(s.total_itineraries || 0), 0)
  const totalFavorites = Object.values(stats).reduce((sum, s) => sum + Number(s.total_favorites || 0), 0)
  const totalShares = Object.values(stats).reduce((sum, s) => sum + Number(s.total_shares || 0), 0)

  if (loading) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <ChevronLeft size={16} /> Retour
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mon espace propriétaire</h1>
            <p className="text-sm text-gray-500 mt-0.5">{machines.length} machine{machines.length > 1 ? 's' : ''} enregistrée{machines.length > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => navigate('/owner/claim')}
            className="bg-primary text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Stats globales */}
        {machines.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Vue d'ensemble</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Eye size={16} className="text-blue-500" />
                  <span className="text-xs text-gray-500">Vues totales</span>
                </div>
                <p className="text-3xl font-bold text-black">{totalViews.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Navigation size={16} className="text-green-500" />
                  <span className="text-xs text-gray-500">Itinéraires</span>
                </div>
                <p className="text-3xl font-bold text-black">{totalItineraries.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={16} className="text-red-500" />
                  <span className="text-xs text-gray-500">Favoris</span>
                </div>
                <p className="text-3xl font-bold text-black">{totalFavorites.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Share2 size={16} className="text-purple-500" />
                  <span className="text-xs text-gray-500">Partages</span>
                </div>
                <p className="text-3xl font-bold text-black">{totalShares.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Machines approuvées */}
        {machines.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Mes machines</h2>
            <div className="space-y-3">
              {machines.map(machine => {
                const s = stats[machine.distributor_id] || {}
                return (
                  <div key={machine.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-black">{machine.distributor_name || 'Machine sans nom'}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            machine.subscription_status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {machine.subscription_status === 'active' ? '🔴 Premium'
                            : machine.subscription_status === 'essentiel' ? '🔵 Essentiel'
                            : 'Gratuit'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{machine.distributor_address}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/map?distributor=${machine.distributor_id}`)}
                        className="text-xs text-primary font-medium ml-2"
                      >
                        Voir →
                      </button>
                    </div>

                    {/* Stats de la machine */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-0.5">
                          <Eye size={12} className="text-blue-400" />
                        </div>
                        <p className="text-lg font-bold">{Number(s.total_views || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Vues</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-0.5">
                          <Navigation size={12} className="text-green-400" />
                        </div>
                        <p className="text-lg font-bold">{Number(s.total_itineraries || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Itin.</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-0.5">
                          <Heart size={12} className="text-red-400" />
                        </div>
                        <p className="text-lg font-bold">{Number(s.total_favorites || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Favoris</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-0.5">
                          <Share2 size={12} className="text-purple-400" />
                        </div>
                        <p className="text-lg font-bold">{Number(s.total_shares || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Partages</p>
                      </div>
                    </div>

                    {/* 30 derniers jours */}
                    {(s.views_last_30d > 0 || s.itineraries_last_30d > 0) && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                        <TrendingUp size={13} className="text-primary" />
                        <span className="text-xs text-gray-500">
                          30 derniers jours : <strong>{Number(s.views_last_30d || 0)} vues</strong> · <strong>{Number(s.itineraries_last_30d || 0)} itinéraires</strong>
                        </span>
                      </div>
                    )}

                    {/* Bannière abonnement */}
                    {machine.subscription_status === 'free' || !machine.subscription_status ? (
                      <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-primary font-bold">🚀 Boostez votre visibilité</p>
                          <p className="text-xs text-gray-500">Marqueur pulsant, stats, alertes...</p>
                        </div>
                        <button
                          onClick={() => navigate('/owner/subscription')}
                          className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold flex-shrink-0 ml-2"
                        >
                          Voir offres
                        </button>
                      </div>
                    ) : machine.subscription_status === 'essentiel' ? (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-blue-700 font-bold">⬆️ Passez Premium</p>
                          <p className="text-xs text-gray-500">Ajoutez les alertes consommateurs</p>
                        </div>
                        <button
                          onClick={() => navigate('/owner/subscription')}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold flex-shrink-0 ml-2"
                        >
                          24 €/mois
                        </button>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Revendications en attente */}
        {pendingClaims.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">En attente de validation</h2>
            <div className="space-y-2">
              {pendingClaims.map(claim => (
                <div key={claim.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{claim.distributor_name || 'Machine sans nom'}</p>
                    <p className="text-xs text-gray-500">{claim.distributor_address}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    claim.status === 'pending' ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                    {claim.status === 'pending' ? '⏳ En attente' : '❌ Refusé'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aucune machine */}
        {machines.length === 0 && pendingClaims.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-4xl mb-4">🤖</p>
            <h2 className="text-xl font-bold mb-2">Aucune machine enregistrée</h2>
            <p className="text-sm text-gray-500 mb-6">Revendiquez vos machines pour accéder à leurs statistiques et les mettre en avant.</p>
            <button
              onClick={() => navigate('/owner/claim')}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm"
            >
              + Revendiquer une machine
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
