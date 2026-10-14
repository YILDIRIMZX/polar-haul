import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the app under /<repo>/. Set BASE=/<repo>/ when building for it.
const base = process.env.BASE ?? '/'
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

export default defineConfig({
  base,
  server: { host: true },
  // The app's version, from package.json; the test panel shows it and marks what is new in it.
  define: { __APP_VERSION__: JSON.stringify(version) },
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
        background_color: '#e9eef1',
        theme_color: '#e9eef1',
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
