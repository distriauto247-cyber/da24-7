import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ChevronRight, MapPin, Phone, Globe } from 'lucide-react'

export default function InstallersList() {
  const navigate = useNavigate()
  const [installers, setInstallers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('installers')
      .select('*')
      .eq('is_visible', true)
      .in('subscription_status', ['free', 'active'])
      .order('is_featured', { ascending: false })
      .order('company_name')
      .then(({ data, error }) => {
        if (!error) setInstallers(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-secondary pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-2">← Retour</button>
        <h1 className="text-2xl font-bold text-black">Installateurs partenaires</h1>
        <p className="text-sm text-gray-500 mt-1">Professionnels de la distribution automatique</p>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && installers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">Aucun installateur référencé</p>
            <p className="text-sm mt-1">Revenez bientôt !</p>
          </div>
        )}

        {installers.map(installer => (
          <button
            key={installer.id}
            onClick={() => navigate(`/installer/${installer.id}`)}
            className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 text-left"
          >
            {/* Logo */}
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {installer.logo_url
                ? <img src={installer.logo_url} alt={installer.company_name} className="w-full h-full object-contain" />
                : <span className="text-2xl font-bold text-primary">{installer.company_name[0]}</span>
              }
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-black truncate">{installer.company_name}</h2>
                {installer.is_featured && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">⭐ Pro</span>
                )}
              </div>
              {installer.slogan && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{installer.slogan}</p>
              )}
              {installer.coverage_area && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={11} className="text-primary flex-shrink-0" />
                  <span className="text-xs text-gray-500 truncate">{installer.coverage_area}</span>
                </div>
              )}
            </div>

            <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
