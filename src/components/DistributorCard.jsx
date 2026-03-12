import { MapPin, Star, Snowflake, Flame, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DistributorCard({ distributor, onFavoriteToggle, isFavorite }) {
  const navigate = useNavigate()

  return (
    <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/distributor/${distributor.id}`)}>
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
          {distributor.photo_url ? (
            <img src={distributor.photo_url} alt={distributor.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <MapPin size={32} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-lg truncate">{distributor.name}</h3>
            {/* Rating */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(distributor.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>

          <p className="text-sm text-accent-gray truncate mb-2">{distributor.address}</p>

          {/* Badges */}
          <div className="flex items-center gap-3 text-sm">
            {/* Temperature */}
            <div className="flex items-center gap-1">
              {distributor.is_cold ? (
                <Snowflake size={16} className="text-blue-500" />
              ) : (
                <Flame size={16} className="text-red-500" />
              )}
              <span className="text-xs">{distributor.is_cold ? 'Froid' : 'Chaud'}</span>
            </div>

            {/* Parking */}
            <div className="flex items-center gap-1">
              {distributor.has_parking ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <X size={16} className="text-red-500" />
              )}
              <span className="text-xs">Parking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button className="btn-primary flex-1">
          ITINÉRAIRE
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavoriteToggle?.(distributor.id)
          }}
          className={`btn-secondary flex items-center justify-center gap-2 ${isFavorite ? 'bg-primary text-white border-primary' : ''}`}
        >
          <span className="text-lg">{isFavorite ? '♥' : '♡'}</span>
          {isFavorite ? 'Retirer' : 'Ajouter'}
        </button>
      </div>
    </div>
  )
}
