import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192x192.png', 'favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'NexaGlow Shop Manager',
        short_name: 'NexaGlow',
        description: 'Super Premium Business Management System',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'C:/Users/seeni/OneDrive/Desktop/New folder/vegetable-app/public/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'C:/Users/seeni/OneDrive/Desktop/New folder/vegetable-app/public/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
