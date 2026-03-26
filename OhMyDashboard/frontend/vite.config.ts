import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      },
      '/system': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => `/api/v1${path}`
      },
      '/status': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => `/api/v1${path}`
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})
