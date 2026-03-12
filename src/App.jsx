import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

// Layouts
import MainLayout from './layouts/MainLayout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetConfirmation from './pages/ResetConfirmation'
import MapView from './pages/MapView'
import DistributorDetail from './pages/DistributorDetail'
import OwnerDistributors from './pages/OwnerDistributors'
import Favorites from './pages/Favorites'
import Settings from './pages/Settings'
import ReportProblem from './pages/ReportProblem'
import AppVersion from './pages/AppVersion'
import AddDistributor from './pages/AddDistributor'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import Account from './pages/Account'
import FAQ from './pages/FAQ'
import CompanyPage from './pages/CompanyPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier la session utilisateur au démarrage
    // Délai minimum de 1.5s pour le splash screen
    const minDelay = new Promise(resolve => setTimeout(resolve, 1500))
    const sessionCheck = supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    Promise.all([minDelay, sessionCheck]).then(() => setLoading(false))

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#F5F0EB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}>
        <img
          src="/logo-transparent.png"
          alt="DA24/7"
          style={{ width: '72vw', maxWidth: '320px', height: 'auto', marginBottom: '24px' }}
        />
        <p style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#E53935',
          textAlign: 'center',
          letterSpacing: '0.5px',
          margin: 0,
        }}>
          Distributeurs automatiques
        </p>
        <p style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#E53935',
          textAlign: 'center',
          letterSpacing: '0.5px',
          margin: '4px 0 0 0',
        }}>
          24/24 &nbsp;7/7
        </p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Routes publiques (sans layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-confirmation" element={<ResetConfirmation />} />

        {/* Routes avec layout (bottom navigation) */}
        <Route element={<MainLayout user={user} />}>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/add-distributor" element={<AddDistributor />} />
          <Route path="/distributor/:id" element={<DistributorDetail />} />
          <Route path="/owner-distributors" element={<OwnerDistributors />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/reports" element={<Admin />} />
          <Route path="/account" element={<Account />} />
          <Route path="/favorites" element={<Favorites user={user} />} />
          <Route path="/settings" element={<Settings user={user} />} />
          <Route path="/report-problem/:id" element={<ReportProblem />} />
          <Route path="/app-version" element={<AppVersion />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/account" element={<Account />} />
          <Route path="/company/:id" element={<CompanyPage />} />
        </Route>
        <Route element={<MainLayout user={user} />}>
  {/* ... autres routes */}
  <Route path="/admin" element={<Admin />} />
</Route>
      </Routes>
    </Router>
  )
}

export default App
