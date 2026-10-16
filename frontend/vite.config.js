import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Sub-path hosting: BASE_PATH (/jokesmith.lol, the JOKESMITH_BASE_PATH Docker
// build arg) is baked into every URL the bundle emits; src/basePath.js reads
// it back. A proxy in front strips it. Unset = the site root.
const basePath = (process.env.BASE_PATH || '').replace(/^\/+|\/+$/g, '')
const base = basePath ? `/${basePath}/` : '/'

// The paths the backend serves; everything else is the app. nginx proxies the
// same ones in Docker, the dev server below.
const backendPaths = ['api'].map((p) => base + p)

// The browser only ever talks to the Vite origin, so the backend's `pid`
// identity cookie is same-origin. Like the proxy in front in Docker, the
// prefix is stripped and sent as X-Forwarded-Prefix.
const toBackend = {
  target: `http://localhost:${process.env.VITE_API_PORT || '48200'}`,
  rewrite: (path) => path.slice(base.length - 1),
  headers: basePath ? { 'X-Forwarded-Prefix': `/${basePath}` } : {},
}

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT || 5200),
    strictPort: true,
    proxy: Object.fromEntries(backendPaths.map((p) => [p, toBackend])),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    globals: true,
  },
})
