import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import InstallPrompt from './components/InstallPrompt'

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
import InstallersList from './pages/InstallersList'
import InstallerProfile from './pages/InstallerProfile'
import AdminInstallers from './pages/AdminInstallers'
import OwnerDashboard from './pages/OwnerDashboard'
import OwnerGateway from './pages/OwnerGateway'
import SignalConfirmation from './pages/SignalConfirmation'
import OwnerLanding from './pages/OwnerLanding'
import OwnerClaim from './pages/OwnerClaim'
import ReportIssue from './pages/ReportIssue'
import OwnerSubscription from './pages/OwnerSubscription'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier la session utilisateur au démarrage
    // Délai volontaire de 1500ms : c'est l'intro (logo + titre), assumée comme telle,
    // pas une sécurité technique. Le splash visible est celui en HTML (index.html),
    // pas de second écran React dupliqué ici.
    const minDelay = new Promise(resolve => setTimeout(resolve, 1500))
    const sessionCheck = supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    Promise.all([minDelay, sessionCheck]).then(() => {
      setLoading(false)
      const splash = document.getElementById('splash')
      if (splash) splash.style.display = 'none'
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    // Rien à afficher ici : le splash HTML (#splash, dans index.html) est encore
    // visible à l'écran (z-index 99999) tant que loading est true.
    return null
  }

  return (
    <Router>
      <InstallPrompt />
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
          <Route path="/installers" element={<InstallersList />} />
          <Route path="/installer/:id" element={<InstallerProfile />} />
          <Route path="/admin/installers" element={<AdminInstallers />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/gateway" element={<OwnerGateway />} />
          <Route path="/signal-confirmation" element={<SignalConfirmation />} />
          <Route path="/owner-landing" element={<OwnerLanding />} />
          <Route path="/owner/claim" element={<OwnerClaim />} />
          <Route path="/report-issue" element={<ReportIssue />} />
          <Route path="/owner/subscription" element={<OwnerSubscription />} />
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
