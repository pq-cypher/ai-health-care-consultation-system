import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // <-- This is required
    proxy: {
      '/api': {
        target: 'http://ai-health-care-consultation-system.local/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
})
