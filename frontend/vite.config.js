import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The browser only ever talks to the Vite origin; /api is proxied so the
// backend's `pid` identity cookie is same-origin.
const apiPort = process.env.VITE_API_PORT || '48200'
// Optional sub-path (BASE_PATH=/jokesmith.lol, baked in at build time); '' serves at /.
const base = `${(process.env.BASE_PATH || '').replace(/\/+$/, '')}/`

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT || 5200),
    strictPort: true,
    proxy: { '/api': `http://localhost:${apiPort}` },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    globals: true,
  },
})
