import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: 'terser',
    chunkSizeWarningLimit: 1600,
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: mode === 'production' 
          ? process.env.VITE_API_URL 
          : 'http://localhost:3000',
        changeOrigin: true,
        secure: mode === 'production',
      },
    },
  },
}))
