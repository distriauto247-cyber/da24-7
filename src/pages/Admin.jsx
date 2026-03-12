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

  const approveReport = async (report) => {
    if (!confirm(`Approuver ce signalement et créer un distributeur ?`)) return

    try {
      // Extraire la ville de l'adresse (ex: "85600 Montaigu-Vendée" -> "Montaigu-Vendée")
      const addressParts = report.address.split(',').map(p => p.trim())
      const lastPart = addressParts[addressParts.length - 1] || ''
      const cityMatch = lastPart.match(/\d{5}\s+(.+)/) // Match "85600 Montaigu-Vendée"
      const city = cityMatch ? cityMatch[1] : lastPart || 'Non renseigné'

      // 1. Créer le distributeur dans la table distributors
      const { data: newDistributor, error: distError } = await supabase
        .from('distributors')
        .insert([{
          name: `Distributeur ${report.category}`,
          category: report.category,
          address: report.address,
          city: city,
          latitude: report.latitude,
          longitude: report.longitude,
          hours: '24h/24 - 7j/7', // Valeur par défaut
          products: 'À définir',
          payment_methods: 'CB',
          contact: report.email || 'Non renseigné',
          description: report.comment || '',
          status: 'active', // Directement actif
          owner_id: null // Pas de propriétaire pour les signalements
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
      <p className="text-center text-gray-600 mb-8">Gestion des signalements</p>

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
    </div>
  )
}
