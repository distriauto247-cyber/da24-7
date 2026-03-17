import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Force le SW à se mettre à jour immédiatement sans attendre la fermeture de l'onglet
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // Ne pas mettre en cache les fichiers JS/CSS (ils ont déjà un hash Vite)
        runtimeCaching: [],
      },
      includeAssets: ['favicon.ico', 'logo.png', 'logo-transparent.png'],
      manifest: {
        name: 'DA24/7 - Distributeurs Automatiques',
        short_name: 'DA24/7',
        description: 'Trouvez tous les distributeurs automatiques près de vous',
        theme_color: '#E53935',
        background_color: '#F5F0EB',
        display: 'standalone',
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000
  },
  build: {
    // Hash unique dans le nom de chaque fichier JS/CSS à chaque build
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    }
  }
})
