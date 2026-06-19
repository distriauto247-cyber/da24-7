import { useState, useEffect } from 'react'

const STORAGE_KEY = 'installPromptShown'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true // iOS Safari
  )
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState(null) // 'native' | 'ios'

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(STORAGE_KEY)) return

    if (isIOS()) {
      setPlatform('ios')
      setVisible(true)
      return
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setPlatform('native')
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    // Que l'utilisateur accepte ou refuse, on ne reproposera plus
    dismiss()
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: '12px',
        right: '12px',
        bottom: '12px',
        zIndex: 9998,
        backgroundColor: '#fff',
        borderRadius: '14px',
        boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <img
        src="/logo-192.png"
        alt="DA24/7"
        style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '8px' }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#222' }}>
          Installer DA24/7
        </p>
        {platform === 'ios' ? (
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#555' }}>
            Appuie sur Partager puis "Sur l'écran d'accueil"
          </p>
        ) : (
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#555' }}>
            Ajoute l'app sur ton écran d'accueil
          </p>
        )}
      </div>

      {platform === 'native' && (
        <button
          onClick={handleInstallClick}
          style={{
            backgroundColor: '#E53935',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            fontWeight: 600,
            fontSize: '13px',
            flexShrink: 0,
          }}
        >
          Installer
        </button>
      )}

      <button
        onClick={dismiss}
        aria-label="Fermer"
        style={{
          background: 'none',
          border: 'none',
          fontSize: '18px',
          color: '#999',
          padding: '0 4px',
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}
