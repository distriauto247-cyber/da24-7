import { Outlet, useNavigate, useLocation } from 'react-router-dom'

// Import des icônes personnalisées
import iconAccueil from '../assets/icons/accueil.png'
import iconCarte from '../assets/icons/carte.png'
import iconFavoris from '../assets/icons/favoris.png'
import iconParametres from '../assets/icons/parametres.png'
import iconProprietaire from '../assets/icons/proprietaire.png'

export default function MainLayout({ user }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: iconAccueil, label: 'Accueil', path: '/', hideOnHome: true },
    { icon: iconCarte, label: 'Carte directe', path: '/map', hideOnHome: false },
    { icon: iconFavoris, label: 'Favoris', path: '/favorites', hideOnHome: false },
    { icon: iconProprietaire, label: 'Propriétaire', path: '/owner/gateway', hideOnHome: false },
    { icon: iconParametres, label: 'Paramètres', path: '/settings', hideOnHome: false },
  ]

  // Filtrer les items : cacher "Accueil" si on est sur la page Home
  const visibleNavItems = navItems.filter(item => {
    if (item.hideOnHome && location.pathname === '/') {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-secondary pb-20">
      {/* Contenu principal */}
      <main className="max-w-md mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="bottom-nav-item"
              >
                <img 
                  src={item.icon} 
                  alt={item.label}
                  className={`w-6 h-6 ${isActive ? 'opacity-100' : 'opacity-60'}`}
                />
                <span className={`text-xs mt-1 ${isActive ? 'text-primary font-semibold' : 'text-accent-gray'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
