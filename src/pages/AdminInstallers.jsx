import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../hooks/useAdmin'
import { Plus, Edit2, Trash2, ChevronLeft, Save, X } from 'lucide-react'

const EMPTY_FORM = {
  company_name: '',
  slogan: '',
  description: '',
  logo_url: '',
  email: '',
  phone: '',
  website: '',
  coverage_area: '',
  years_experience: '',
  brands_distributed: '',
  certifications: '',
  intervention_delay: '',
  subscription_status: 'free',
  is_visible: true,
  is_featured: false,
}

export default function AdminInstallers() {
  const navigate = useNavigate()
  const { isAdmin } = useAdmin()
  const [installers, setInstallers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [leads, setLeads] = useState([])
  const [showLeads, setShowLeads] = useState(false)
  const [selectedInstallerId, setSelectedInstallerId] = useState(null)

  useEffect(() => {
    if (isAdmin) loadInstallers()
  }, [isAdmin])

  const loadInstallers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('installers')
      .select('*')
      .order('created_at', { ascending: false })
    setInstallers(data || [])
    setLoading(false)
  }

  const handleEdit = (installer) => {
    setForm({
      company_name: installer.company_name || '',
      slogan: installer.slogan || '',
      description: installer.description || '',
      logo_url: installer.logo_url || '',
      email: installer.email || '',
      phone: installer.phone || '',
      website: installer.website || '',
      coverage_area: installer.coverage_area || '',
      years_experience: installer.years_experience || '',
      brands_distributed: installer.brands_distributed || '',
      certifications: installer.certifications || '',
      intervention_delay: installer.intervention_delay || '',
      subscription_status: installer.subscription_status || 'free',
      is_visible: installer.is_visible ?? true,
      is_featured: installer.is_featured ?? false,
    })
    setEditingId(installer.id)
    setShowForm(true)
  }

  const handleNew = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.company_name.trim()) return
    setSaving(true)

    const payload = {
      ...form,
      years_experience: form.years_experience ? parseInt(form.years_experience) : null,
      updated_at: new Date().toISOString(),
    }

    let error
    if (editingId) {
      ;({ error } = await supabase.from('installers').update(payload).eq('id', editingId))
    } else {
      ;({ error } = await supabase.from('installers').insert(payload))
    }

    setSaving(false)
    if (!error) {
      setShowForm(false)
      loadInstallers()
    } else {
      alert('Erreur : ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet installateur ?')) return
    await supabase.from('installers').delete().eq('id', id)
    loadInstallers()
  }

  const handleViewLeads = async (installerId) => {
    setSelectedInstallerId(installerId)
    const { data } = await supabase
      .from('installer_leads')
      .select('*')
      .eq('installer_id', installerId)
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setShowLeads(true)
  }

  const statusColors = {
    free: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-4 shadow-sm">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <ChevronLeft size={16} /> Tableau de bord
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Installateurs</h1>
          <button onClick={handleNew} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg">{editingId ? 'Modifier' : 'Nouvel installateur'}</h2>
              <button onClick={() => setShowForm(false)}><X size={22} className="text-gray-400" /></button>
            </div>

            <div className="px-4 py-4 space-y-3">
              {/* Nom obligatoire */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Nom société *</label>
                <input value={form.company_name} onChange={e => setForm(p => ({...p, company_name: e.target.value}))}
                  placeholder="Ex: Vending Solutions SAS"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Slogan</label>
                <input value={form.slogan} onChange={e => setForm(p => ({...p, slogan: e.target.value}))}
                  placeholder="Ex: Votre partenaire distribution"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
                  placeholder="Présentation de la société..."
                  rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">URL Logo</label>
                <input value={form.logo_url} onChange={e => setForm(p => ({...p, logo_url: e.target.value}))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Téléphone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                    placeholder="0600000000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label>
                  <input value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                    placeholder="contact@..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Site web</label>
                <input value={form.website} onChange={e => setForm(p => ({...p, website: e.target.value}))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Zone d'intervention</label>
                <input value={form.coverage_area} onChange={e => setForm(p => ({...p, coverage_area: e.target.value}))}
                  placeholder="Ex: Pays de la Loire, Bretagne"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Années d'expérience</label>
                  <input type="number" value={form.years_experience} onChange={e => setForm(p => ({...p, years_experience: e.target.value}))}
                    placeholder="Ex: 10"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Délai d'intervention</label>
                  <input value={form.intervention_delay} onChange={e => setForm(p => ({...p, intervention_delay: e.target.value}))}
                    placeholder="Ex: Sous 48h"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Marques distribuées</label>
                <input value={form.brands_distributed} onChange={e => setForm(p => ({...p, brands_distributed: e.target.value}))}
                  placeholder="Ex: Selecta, Necta, Azkoyen"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Certifications</label>
                <input value={form.certifications} onChange={e => setForm(p => ({...p, certifications: e.target.value}))}
                  placeholder="Ex: ISO 9001, NF..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>

              {/* Abonnement */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Statut abonnement</label>
                <select value={form.subscription_status} onChange={e => setForm(p => ({...p, subscription_status: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white">
                  <option value="free">Gratuit</option>
                  <option value="active">Actif (payant)</option>
                  <option value="suspended">Suspendu</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_visible} onChange={e => setForm(p => ({...p, is_visible: e.target.checked}))}
                    className="w-4 h-4 accent-primary" />
                  <span className="text-sm">Visible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({...p, is_featured: e.target.checked}))}
                    className="w-4 h-4 accent-primary" />
                  <span className="text-sm">⭐ Pro (mis en avant)</span>
                </label>
              </div>

              <button onClick={handleSave} disabled={saving || !form.company_name.trim()}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                <Save size={16} />
                {saving ? 'Enregistrement...' : 'ENREGISTRER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des leads */}
      {showLeads && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg">Demandes de devis ({leads.length})</h2>
              <button onClick={() => setShowLeads(false)}><X size={22} className="text-gray-400" /></button>
            </div>
            <div className="px-4 py-4 space-y-3">
              {leads.length === 0 && <p className="text-gray-400 text-center py-6">Aucune demande</p>}
              {leads.map(lead => (
                <div key={lead.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm">{lead.name}</p>
                      {lead.company && <p className="text-xs text-gray-500">{lead.company}</p>}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(lead.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    {lead.email && <p>✉️ {lead.email}</p>}
                    {lead.phone && <p>📞 {lead.phone}</p>}
                    {lead.location && <p>📍 {lead.location}</p>}
                    {lead.message && <p className="mt-2 text-gray-700 border-t pt-2">{lead.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Liste installateurs */}
      <div className="px-4 pt-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && installers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">Aucun installateur</p>
            <p className="text-sm mt-1">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}

        {installers.map(installer => (
          <div key={installer.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {installer.logo_url
                  ? <img src={installer.logo_url} alt={installer.company_name} className="w-full h-full object-contain" />
                  : <span className="text-xl font-bold text-primary">{installer.company_name[0]}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold truncate">{installer.company_name}</p>
                  {installer.is_featured && <span className="text-xs">⭐</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[installer.subscription_status]}`}>
                    {installer.subscription_status === 'free' ? 'Gratuit'
                      : installer.subscription_status === 'active' ? 'Actif'
                      : installer.subscription_status === 'suspended' ? 'Suspendu' : 'Annulé'}
                  </span>
                  {!installer.is_visible && <span className="text-xs text-gray-400">Masqué</span>}
                </div>
              </div>
            </div>

            {installer.coverage_area && (
              <p className="text-xs text-gray-500 mb-3">📍 {installer.coverage_area}</p>
            )}

            <div className="flex gap-2">
              <button onClick={() => handleViewLeads(installer.id)}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-xs font-medium">
                📋 Devis reçus
              </button>
              <button onClick={() => handleEdit(installer)}
                className="flex-1 border border-primary text-primary py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                <Edit2 size={13} /> Modifier
              </button>
              <button onClick={() => handleDelete(installer.id)}
                className="border border-red-200 text-red-500 px-3 py-2 rounded-lg">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
