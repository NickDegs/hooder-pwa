import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// VITE_TARGET=capacitor → iOS/Android native build (base /, PWA kapalı)
// Varsayılan        → web sunucusu build (base /hooder/, PWA açık)
const isCapacitor = process.env.VITE_TARGET === 'capacitor'
const base        = isCapacitor ? '/' : '/hooder/'

export default defineConfig({
  base,
  plugins: [
    react(),
    ...(isCapacitor ? [] : [
      VitePWA({
        registerType: 'autoUpdate',
        base,
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
          navigateFallback: '/hooder/index.html',
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        },
      }),
    ]),
  ],
  optimizeDeps: {
    include: ['mapbox-gl'],
  },
})
