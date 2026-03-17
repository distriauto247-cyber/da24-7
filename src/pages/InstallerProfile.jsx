import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MapPin, Phone, Globe, Mail, Clock, Star, Send, ChevronDown, ChevronUp } from 'lucide-react'

export default function InstallerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [installer, setInstaller] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', company: '', message: '', category_needed: '', location: '' })
  const [leadSent, setLeadSent] = useState(false)
  const [leadSending, setLeadSending] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('installers').select('*').eq('id', id).single(),
      supabase.from('installer_reviews').select('*').eq('installer_id', id).order('created_at', { ascending: false })
    ]).then(([{ data: inst }, { data: revs }]) => {
      setInstaller(inst)
      setReviews(revs || [])
      setLoading(false)
    })
  }, [id])

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const handleSendLead = async (e) => {
    e.preventDefault()
    setLeadSending(true)
    const { error } = await supabase.from('installer_leads').insert({
      installer_id: id,
      ...leadForm,
    })
    setLeadSending(false)
    if (!error) {
      setLeadSent(true)
      setShowLeadForm(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!installer) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <p className="text-gray-500">Installateur introuvable</p>
    </div>
  )

  const catalog = installer.machines_catalog || []

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-6 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-4">← Retour</button>

        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
            {installer.logo_url
              ? <img src={installer.logo_url} alt={installer.company_name} className="w-full h-full object-contain p-1" />
              : <span className="text-3xl font-bold text-primary">{installer.company_name[0]}</span>
            }
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-xl text-black">{installer.company_name}</h1>
              {installer.is_featured && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">⭐ Pro</span>
              )}
            </div>
            {installer.slogan && <p className="text-sm text-gray-500 mt-0.5 italic">"{installer.slogan}"</p>}
            {avgRating && (
              <div className="flex items-center gap-1 mt-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold">{avgRating}</span>
                <span className="text-xs text-gray-400">({reviews.length} avis)</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {installer.description && (
          <p className="text-sm text-gray-600 mt-4 leading-relaxed">{installer.description}</p>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Infos clés */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="font-bold text-black">Informations</h2>

          {installer.coverage_area && (
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Zone d'intervention</p>
                <p className="text-sm text-black">{installer.coverage_area}</p>
              </div>
            </div>
          )}
          {installer.years_experience && (
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Expérience</p>
                <p className="text-sm text-black">{installer.years_experience} ans</p>
              </div>
            </div>
          )}
          {installer.brands_distributed && (
            <div className="flex items-start gap-3">
              <span className="text-primary text-sm mt-0.5">🏭</span>
              <div>
                <p className="text-xs text-gray-400">Marques distribuées</p>
                <p className="text-sm text-black">{installer.brands_distributed}</p>
              </div>
            </div>
          )}
          {installer.intervention_delay && (
            <div className="flex items-start gap-3">
              <span className="text-primary text-sm mt-0.5">⚡</span>
              <div>
                <p className="text-xs text-gray-400">Délai d'intervention</p>
                <p className="text-sm text-black">{installer.intervention_delay}</p>
              </div>
            </div>
          )}
          {installer.certifications && (
            <div className="flex items-start gap-3">
              <span className="text-primary text-sm mt-0.5">🏅</span>
              <div>
                <p className="text-xs text-gray-400">Certifications</p>
                <p className="text-sm text-black">{installer.certifications}</p>
              </div>
            </div>
          )}
        </div>

        {/* Catalogue machines */}
        {catalog.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <button
              onClick={() => setShowCatalog(!showCatalog)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="font-bold text-black">Catalogue machines ({catalog.length})</h2>
              {showCatalog ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>

            {showCatalog && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {catalog.map((machine, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-3">
                    {machine.photo_url && (
                      <img src={machine.photo_url} alt={machine.model} className="w-full h-24 object-contain mb-2" />
                    )}
                    <p className="text-xs font-bold text-black">{machine.brand}</p>
                    <p className="text-xs text-gray-500">{machine.model}</p>
                    {machine.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">{machine.category}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Avis */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-bold text-black mb-3">Avis clients</h2>
            <div className="space-y-3">
              {reviews.slice(0, 3).map(review => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="font-bold text-black">Contact</h2>
          {installer.phone && (
            <a href={`tel:${installer.phone}`} className="flex items-center gap-3">
              <Phone size={16} className="text-primary" />
              <span className="text-sm text-primary font-medium">{installer.phone}</span>
            </a>
          )}
          {installer.email && (
            <a href={`mailto:${installer.email}`} className="flex items-center gap-3">
              <Mail size={16} className="text-primary" />
              <span className="text-sm text-primary font-medium">{installer.email}</span>
            </a>
          )}
          {installer.website && (
            <a href={installer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <Globe size={16} className="text-primary" />
              <span className="text-sm text-primary font-medium">{installer.website}</span>
            </a>
          )}
        </div>

        {/* Formulaire devis */}
        {leadSent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-semibold">✅ Demande envoyée !</p>
            <p className="text-green-600 text-sm mt-1">{installer.company_name} vous recontactera rapidement.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <button
              onClick={() => setShowLeadForm(!showLeadForm)}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm"
            >
              {showLeadForm ? 'Annuler' : '📋 DEMANDER UN DEVIS'}
            </button>

            {showLeadForm && (
              <form onSubmit={handleSendLead} className="mt-4 space-y-3">
                <input required placeholder="Votre nom *" value={leadForm.name} onChange={e => setLeadForm(p => ({...p, name: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                <input required type="email" placeholder="Email *" value={leadForm.email} onChange={e => setLeadForm(p => ({...p, email: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                <input placeholder="Téléphone" value={leadForm.phone} onChange={e => setLeadForm(p => ({...p, phone: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                <input placeholder="Société" value={leadForm.company} onChange={e => setLeadForm(p => ({...p, company: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                <input placeholder="Localisation souhaitée" value={leadForm.location} onChange={e => setLeadForm(p => ({...p, location: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                <textarea placeholder="Votre message / besoin" value={leadForm.message} onChange={e => setLeadForm(p => ({...p, message: e.target.value}))}
                  rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
                <button type="submit" disabled={leadSending}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  <Send size={16} />
                  {leadSending ? 'Envoi...' : 'ENVOYER MA DEMANDE'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
