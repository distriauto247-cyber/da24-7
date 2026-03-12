import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DistributorCard from '../components/DistributorCard'

export default function OwnerDistributors() {
  const navigate = useNavigate()
  const [distributors, setDistributors] = useState([])
  const [loading, setLoading] = useState(true)
  const [ownerName, setOwnerName] = useState('Nom Commerçant')
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    loadDistributors()
  }, [])

  const loadDistributors = async () => {
    try {
      // TODO: Filtrer par owner_id une fois l'authentification en place
      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .limit(20)

      if (error) throw error
      setDistributors(data || [])
    } catch (error) {
      console.error('Error loading distributors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = async (distributorId) => {
    if (favorites.includes(distributorId)) {
      setFavorites(favorites.filter(id => id !== distributorId))
    } else {
      setFavorites([...favorites, distributorId])
    }
  }

  return (
    <div className="min-h-screen bg-secondary pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-xl font-bold">{ownerName}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-accent-gray">Chargement...</p>
          </div>
        ) : distributors.length > 0 ? (
          distributors.map((distributor) => (
            <DistributorCard
              key={distributor.id}
              distributor={distributor}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={favorites.includes(distributor.id)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-accent-gray">Aucun distributeur trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
