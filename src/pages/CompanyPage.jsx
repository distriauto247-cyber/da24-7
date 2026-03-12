import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, MapPin, Phone, Mail, Building2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const categoryLabels = {
  pain: 'Pain',
  pizza: 'Pizza',
  burger: 'Burger',
  alimentaire: 'Alimentaire',
  fleurs: 'Fleurs',
  parapharmacie: 'Parapharmacie',
  autres: 'Autres',
}

export default function CompanyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [distributors, setDistributors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompany()
  }, [id])

  const loadCompany = async () => {
    setLoading(true)
    try {
      // Charger l'entreprise
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (companyError) throw companyError
      setCompany(companyData)

      // Charger les machines de cette entreprise
      const { data: distributorData, error: distributorError } = await supabase
        .from('distributors')
        .select('*')
        .eq('company_id', id)
        .eq('status', 'active')
        .order('name')

      if (distributorError) throw distributorError
      setDistributors(distributorData || [])
    } catch (error) {
      console.error('Erreur chargement entreprise:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDistributorClick = (distributor) => {
    navigate(`/distributor/${distributor.id}`)
  }

  const handleMapClick = (distributor) => {
    navigate(`/map?lat=${distributor.latitude}&lng=${distributor.longitude}&id=${distributor.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6">
        <Building2 size={48} className="text-gray-300" />
        <p className="text-gray-500 text-center">Entreprise introuvable.</p>
        <button onClick={() => navigate(-1)} className="text-primary underline">Retour</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-gray-600">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">{company.name}</h1>
        </div>
      </div>

      {/* Carte entreprise */}
      <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm overflow-hidden">
        {/* Logo / bannière */}
        <div className="bg-primary h-24 flex items-center justify-center">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-20 w-20 object-contain rounded-full bg-white p-1"
            />
          ) : (
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
              <Building2 size={36} className="text-primary" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h2>

          {company.description && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{company.description}</p>
          )}

          {company.contact && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {company.contact.includes('@') ? (
                <Mail size={16} className="text-primary flex-shrink-0" />
              ) : (
                <Phone size={16} className="text-primary flex-shrink-0" />
              )}
              <span>{company.contact}</span>
            </div>
          )}
        </div>
      </div>

      {/* Liste des machines */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 px-1">
          {distributors.length} machine{distributors.length > 1 ? 's' : ''}
        </h3>

        {distributors.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-gray-400 shadow-sm">
            Aucune machine disponible pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {distributors.map((distributor) => (
              <div
                key={distributor.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => handleDistributorClick(distributor)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {categoryLabels[distributor.category] || distributor.category}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900">{distributor.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{distributor.address}</p>
                    </div>
                    <ChevronLeft size={18} className="text-gray-400 rotate-180 flex-shrink-0 mt-1" />
                  </div>
                </button>

                <div className="border-t border-gray-100 px-4 py-2">
                  <button
                    onClick={() => handleMapClick(distributor)}
                    className="flex items-center gap-1.5 text-primary text-sm font-medium"
                  >
                    <MapPin size={14} />
                    Voir sur la carte
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-accent-lightgray text-xs">
        © DA24.7 – Tous droits réservés
      </div>
    </div>
  )
}
