import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// base './' so the build works from any GitHub Pages sub-path
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    // Offline support: after one visit the app keeps working without Wi-Fi
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // we ship our own public/manifest.webmanifest
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          { urlPattern: /^https:\/\/api\.fontshare\.com\//, handler: 'StaleWhileRevalidate', options: { cacheName: 'font-css' } },
          { urlPattern: /^https:\/\/cdn\.fontshare\.com\//, handler: 'CacheFirst', options: { cacheName: 'font-files', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } } },
          { urlPattern: /^https:\/\/tile\.openstreetmap\.org\//, handler: 'CacheFirst', options: { cacheName: 'map-tiles', expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } } },
        ],
      },
    }),
  ],
  build: { chunkSizeWarningLimit: 1200 },
})
