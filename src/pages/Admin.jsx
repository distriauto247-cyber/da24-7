import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, MapPin, Mail, MessageSquare, Calendar, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../hooks/useAdmin'

// Icônes catégories
import iconPain from '../assets/icons/pain.png'
import iconPizza from '../assets/icons/pizza.png'
import iconBurger from '../assets/icons/burger.png'
import iconAlimentaire from '../assets/icons/alimentaire.png'
import iconFleurs from '../assets/icons/fleurs.png'
import iconParapharmacie from '../assets/icons/parapharmacie.png'
import iconAutres from '../assets/icons/autres.png'

const categoryIcons = {
  pain: iconPain,
  pizza: iconPizza,
  burger: iconBurger,
  alimentaire: iconAlimentaire,
  fleurs: iconFleurs,
  parapharmacie: iconParapharmacie,
  autres: iconAutres,
}

const categoryLabels = {
  pain: 'Pain',
  pizza: 'Pizza',
  burger: 'Burger',
  alimentaire: 'Alimentaire',
  fleurs: 'Fleurs',
  parapharmacie: 'Parapharmacie',
  autres: 'Autres',
}

export default function Admin() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading, user } = useAdmin()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // pending | approved | rejected | all
  const [activeTab, setActiveTab] = useState('reports') // reports | claims
  const [claims, setClaims] = useState([])
  const [claimsLoading, setClaimsLoading] = useState(false)
  const [claimsCounts, setClaimsCounts] = useState({ pending: 0, approved: 0, rejected: 0 })
  
  // Compteurs par statut
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })

  useEffect(() => {
    if (isAdmin) {
      loadReports()
      loadClaims()
    }
  }, [filter, isAdmin])

  const loadReports = async () => {
    setLoading(true)
    try {
      // Charger les signalements selon le filtre
      let query = supabase
        .from('distributor_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setReports(data || [])
      
      // Charger les compteurs de tous les statuts
      const { count: pendingCount } = await supabase
        .from('distributor_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      const { count: approvedCount } = await supabase
        .from('distributor_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
      
      const { count: rejectedCount } = await supabase
        .from('distributor_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected')
      
      const { count: totalCount } = await supabase
        .from('distributor_reports')
        .select('*', { count: 'exact', head: true })
      
      setStatusCounts({
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        rejected: rejectedCount || 0,
        total: totalCount || 0
      })
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadClaims = async () => {
    setClaimsLoading(true)
    const { data } = await supabase
      .from('machine_ownership')
      .select('*, users:user_id(email)')
      .order('created_at', { ascending: false })
    setClaims(data || [])
    const pending = (data || []).filter(c => c.status === 'pending').length
    const approved = (data || []).filter(c => c.status === 'approved').length
    const rejected = (data || []).filter(c => c.status === 'rejected').length
    setClaimsCounts({ pending, approved, rejected })
    setClaimsLoading(false)
  }

  // Envoyer une notification push via Edge Function
  const sendPushNotification = async (userId, title, body, data = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ user_id: userId, title, body, data })
      })
    } catch (err) {
      console.warn('Notification non envoyée:', err)
    }
  }

  const approveClaim = async (claim) => {
    if (!confirm(`Approuver la revendication de "${claim.distributor_name}" ?`)) return
    const { error } = await supabase
      .from('machine_ownership')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', claim.id)
    if (!error) {
      // Envoyer une notification push au propriétaire
      await sendPushNotification(
        claim.user_id,
        '✅ Revendication approuvée !',
        `Votre machine "${claim.distributor_name}" est maintenant active sur DA24.7. Découvrez vos statistiques !`,
        { url: '/owner/dashboard' }
      )
      alert('✅ Revendication approuvée !')
      loadClaims()
    } else {
      alert('Erreur : ' + error.message)
    }
  }

  const rejectClaim = async (claim) => {
    if (!confirm(`Rejeter la revendication de "${claim.distributor_name}" ?`)) return
    const { error } = await supabase
      .from('machine_ownership')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', claim.id)
    if (!error) {
      alert('❌ Revendication rejetée')
      loadClaims()
    } else {
      alert('Erreur : ' + error.message)
    }
  }

  const approveReport = async (report) => {
    // Choix : notifier le propriétaire ou créer directement
    const choice = window.confirm(
      `Ce signalement concerne : ${report.address}\n\n` +
      `Cliquez OK pour notifier le propriétaire potentiel et mettre en attente.\n` +
      `Cliquez Annuler pour créer directement la machine.`
    )

    try {
      if (choice) {
        // Option 1 : Marquer comme "notified" et envoyer push si user connu
        const { error: updateError } = await supabase
          .from('distributor_reports')
          .update({ status: 'notified' })
          .eq('id', report.id)
        if (updateError) throw updateError

        // Chercher si un utilisateur avec cet email a un token push
        if (report.email) {
          const { data: userData } = await supabase
            .from('push_tokens')
            .select('user_id')
            .limit(1)

          if (userData && userData.length > 0) {
            await sendPushNotification(
              userData[0].user_id,
              '🤖 Votre machine est sur DA24.7 !',
              'Un utilisateur a signalé votre machine. Revendiquez-la pour gérer sa visibilité et accéder à ses stats.',
              { url: '/owner/dashboard' }
            )
          }
        }

        alert('✅ Signalement marqué "notifié". Le propriétaire sera contacté.')
        await loadReports()
        return
      }

      // Option 2 : Création directe
      const addressParts = report.address.split(',').map(p => p.trim())
      const lastPart = addressParts[addressParts.length - 1] || ''
      const cityMatch = lastPart.match(/\d{5}\s+(.+)/)
      const city = cityMatch ? cityMatch[1] : lastPart || 'Non renseigné'

      const { data: newDistributor, error: distError } = await supabase
        .from('distributors')
        .insert([{
          name: `Distributeur ${report.category}`,
          category: report.category,
          address: report.address,
          city: city,
          latitude: report.latitude,
          longitude: report.longitude,
          hours: '24h/24 - 7j/7',
          products: 'À définir',
          payment_methods: 'CB',
          contact: report.email || 'Non renseigné',
          description: report.comment || '',
          status: 'active',
          owner_id: null
        }])
        .select()

      if (distError) throw distError

      // 2. Mettre à jour le statut du signalement
      const { error: updateError } = await supabase
        .from('distributor_reports')
        .update({ status: 'approved' })
        .eq('id', report.id)

      if (updateError) throw updateError

      alert('✅ Signalement approuvé et distributeur créé !')
      
      // Recharger la liste et revenir au filtre par défaut
      setFilter('pending')
      await loadReports()
    } catch (error) {
      alert('❌ Erreur : ' + error.message)
      console.error(error)
    }
  }

  const rejectReport = async (reportId) => {
    if (!confirm('Rejeter ce signalement ?')) return

    try {
      const { error } = await supabase
        .from('distributor_reports')
        .update({ status: 'rejected' })
        .eq('id', reportId)

      if (error) throw error

      alert('❌ Signalement rejeté')
      
      // Recharger la liste
      setFilter('pending')
      await loadReports()
    } catch (error) {
      alert('Erreur : ' + error.message)
    }
  }

  const deleteReport = async (reportId) => {
    if (!confirm('⚠️ Supprimer définitivement ce signalement ?')) return

    try {
      const { error } = await supabase
        .from('distributor_reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error

      // Mettre à jour la liste localement immédiatement
      setReports(prev => prev.filter(r => r.id !== reportId))

      // Mettre à jour les compteurs
      setStatusCounts(prev => ({
        ...prev,
        approved: filter === 'approved' ? prev.approved - 1 : prev.approved,
        rejected: filter === 'rejected' ? prev.rejected - 1 : prev.rejected,
        total: prev.total - 1,
      }))
    } catch (error) {
      alert('Erreur : ' + error.message)
    }
  }

  const getCategoryLabel = (category) => {
    const icon = categoryIcons[category] || categoryIcons.autres
    const label = categoryLabels[category] || category
    return (
      <span className="flex items-center gap-2">
        <img src={icon} alt={label} className="w-7 h-7 object-contain" />
        {label}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approuvé', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800' }
    }
    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
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
      {/* Bouton retour */}
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-primary mb-4 hover:underline"
      >
        <ArrowLeft size={20} />
        Retour au tableau de bord
      </button>

      {/* Titre */}
      <h1 className="text-3xl font-bold text-center mb-2">Administration</h1>
      <p className="text-center text-gray-600 mb-4">Gestion des signalements et revendications</p>

      {/* Onglets */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'reports' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            Signalements {statusCounts.pending > 0 && <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{statusCounts.pending}</span>}
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'claims' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            Revendications {claimsCounts.pending > 0 && <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{claimsCounts.pending}</span>}
          </button>
        </div>
      </div>

      {/* ---- ONGLET REVENDICATIONS ---- */}
      {activeTab === 'claims' && (
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Filtres revendications */}
          <div className="flex gap-2 flex-wrap justify-center mb-4">
            {[
              { key: 'all', label: `Toutes (${claims.length})` },
              { key: 'pending', label: `En attente (${claimsCounts.pending})` },
              { key: 'approved', label: `Approuvées (${claimsCounts.approved})` },
              { key: 'rejected', label: `Rejetées (${claimsCounts.rejected})` },
            ].map(f => (
              <button key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f.key ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
              >{f.label}</button>
            ))}
          </div>

          {claimsLoading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}

          {!claimsLoading && claims
            .filter(c => filter === 'all' || c.status === filter)
            .map(claim => (
              <div key={claim.id} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-black">{claim.distributor_name || 'Machine sans nom'}</h3>
                    <p className="text-sm text-gray-500">{claim.distributor_address}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${
                    claim.status === 'pending' ? 'bg-orange-100 text-orange-700'
                    : claim.status === 'approved' ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                    {claim.status === 'pending' ? '⏳ En attente'
                      : claim.status === 'approved' ? '✅ Approuvée' : '❌ Rejetée'}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p>👤 Utilisateur : <span className="font-medium">{claim.users?.email || claim.user_id}</span></p>
                  <p>🤖 Machine ID : <span className="font-mono text-xs">{claim.distributor_id}</span></p>
                  <p>📅 {new Date(claim.created_at).toLocaleDateString('fr-FR')}</p>
                  {claim.justification && (
                    <div className="mt-2 bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Justification :</p>
                      <p className="text-sm italic">"{claim.justification}"</p>
                    </div>
                  )}
                </div>

                {claim.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t">
                    <button onClick={() => approveClaim(claim)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2">
                      <CheckCircle size={16} /> Approuver
                    </button>
                    <button onClick={() => rejectClaim(claim)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2">
                      <XCircle size={16} /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))
          }

          {!claimsLoading && claims.filter(c => filter === 'all' || c.status === filter).length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              Aucune revendication
            </div>
          )}
        </div>
      )}

      {/* ---- ONGLET SIGNALEMENTS ---- */}
      {activeTab === 'reports' && (<>

      {/* Filtres */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            En attente ({statusCounts.pending})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'approved'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Approuvés ({statusCounts.approved})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'rejected'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Rejetés ({statusCounts.rejected})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tous ({statusCounts.total})
          </button>
        </div>
      </div>

      {/* Liste des signalements */}
      {reports.length === 0 ? (
        <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 text-center">
          <p className="text-gray-600">Aucun signalement {filter !== 'all' && `${filter}`}</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {getCategoryLabel(report.category)}
                  </h3>
                  {getStatusBadge(report.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} />
                  {new Date(report.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>

              {/* Infos */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                  <span>{report.address}</span>
                </div>

                {report.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail size={18} className="flex-shrink-0 text-primary" />
                    <span>{report.email}</span>
                  </div>
                )}

                {report.comment && (
                  <div className="flex items-start gap-2 text-gray-700">
                    <MessageSquare size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                    <span className="italic">"{report.comment}"</span>
                  </div>
                )}

                {report.latitude && report.longitude && (
                  <div className="text-sm text-gray-500">
                    📍 GPS: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                  </div>
                )}
              </div>

              {/* Actions */}
              {report.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => approveReport(report)}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approuver
                  </button>
                  <button
                    onClick={() => rejectReport(report.id)}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Rejeter
                  </button>
                </div>
              )}

              {report.status !== 'pending' && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Supprimer définitivement
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="max-w-4xl mx-auto mt-8 text-center text-gray-600 text-sm">
        Total : {reports.length} signalement{reports.length > 1 ? 's' : ''}
      </div>
      </>)}
    </div>
  )
}
