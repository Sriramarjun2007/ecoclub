import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const apiUrl =
    env.VITE_API_URL || 'https://ecoclub-3q19.onrender.com'

  return {
    plugins: [react()],

    server: {
      port: 5173,

      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: true,
        },

        '/media': {
          target: apiUrl,
          changeOrigin: true,
          secure: true,
        },
      },
    },

    build: {
      chunkSizeWarningLimit: 1500,
    },
  }
})