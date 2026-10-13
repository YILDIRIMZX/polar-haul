import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the app under /<repo>/. Set BASE=/<repo>/ when building for it.
const base = process.env.BASE ?? '/'

export default defineConfig({
  base,
  server: { host: true },
  // Three.js alone is ~540 kB; one bundle is fine for an offline app.
  build: { chunkSizeWarningLimit: 700 },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Polar Haul',
        short_name: 'Polar Haul',
        description: 'Hunt polar bears, stack the meat, run the processing line and grow a frozen base.',
        lang: 'tr',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#cfe0ea',
        theme_color: '#2c5d7c',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,glb,mp3,woff2}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
})
