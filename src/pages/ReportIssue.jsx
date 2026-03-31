import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ChevronLeft, Send, AlertTriangle } from 'lucide-react'

const ISSUE_TYPES = [
  { value: 'panne', label: 'Machine vide / en panne', emoji: '⚠️' },
  { value: 'paiement', label: 'Problème de paiement (CB refusée)', emoji: '💳' },
  { value: 'produit', label: 'Produit non reçu', emoji: '📦' },
  { value: 'degradation', label: 'Dégradation / vandalisme', emoji: '🔨' },
]

export default function ReportIssue() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const distributorId = searchParams.get('id')
  const distributorName = searchParams.get('name') || 'cette machine'

  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    issue_type: '',
    comment: '',
    email: '',
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        setForm(f => ({ ...f, email: user.email || '' }))
      }
    })
  }, [])

  const handleSubmit = async () => {
    if (!form.issue_type) { setError('Veuillez sélectionner un type de problème.'); return }
    setError(null)
    setSending(true)

    const { error: err } = await supabase.from('distributor_reports').insert({
      distributor_id: distributorId,
      name: distributorName,
      category: 'issue',
      report_type: 'consumer_issue',
      issue_type: form.issue_type,
      comment: form.comment,
      email: form.email,
      status: 'pending',
      user_id: user?.id || null,
    })

    setSending(false)
    if (err) {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.')
    } else {
      setSent(true)
    }
  }

  if (sent) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm max-w-sm w-full">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="text-xl font-bold mb-2">Signalement envoyé !</h2>
        <p className="text-sm text-gray-500 mb-6">
          Merci pour votre retour. Le propriétaire de la machine sera notifié.
        </p>
        <button onClick={() => navigate(-1)}
          className="w-full bg-primary text-white py-3 rounded-lg font-bold">
          Retour à la carte
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <ChevronLeft size={16} /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={20} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Signaler un problème</h1>
            <p className="text-xs text-gray-500 truncate max-w-xs">{distributorName}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Type de problème */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold mb-3 text-sm text-gray-700 uppercase tracking-wide">Type de problème *</h2>
          <div className="space-y-2">
            {ISSUE_TYPES.map(issue => (
              <button
                key={issue.value}
                onClick={() => setForm(f => ({ ...f, issue_type: issue.value }))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition text-left ${
                  form.issue_type === issue.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <span className="text-xl">{issue.emoji}</span>
                <span className={`text-sm font-medium ${form.issue_type === issue.value ? 'text-primary' : 'text-gray-700'}`}>
                  {issue.label}
                </span>
                {form.issue_type === issue.value && (
                  <span className="ml-auto text-primary font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Commentaire */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold mb-3 text-sm text-gray-700 uppercase tracking-wide">Détails (optionnel)</h2>
          <textarea
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            placeholder="Décrivez le problème en quelques mots..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
          />
        </div>

        {/* Email */}
        {!user && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-bold mb-3 text-sm text-gray-700 uppercase tracking-wide">Votre email (optionnel)</h2>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Pour être tenu informé du traitement"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Info propriétaire */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-700 font-medium mb-1">ℹ️ Que se passe-t-il après ?</p>
          <p className="text-xs text-blue-600">
            Si le propriétaire de cette machine est abonné à DA24.7, il recevra une notification immédiate pour traiter votre problème. Sinon, notre équipe le contactera.
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Bouton envoyer */}
        <button
          onClick={handleSubmit}
          disabled={sending || !form.issue_type}
          className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Send size={16} />
          {sending ? 'Envoi...' : 'ENVOYER LE SIGNALEMENT'}
        </button>
      </div>
    </div>
  )
}
