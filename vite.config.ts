import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/hooder/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      base: '/hooder/',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        navigateFallback: '/hooder/index.html',
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  optimizeDeps: {
    include: ['mapbox-gl'],
  },
})
