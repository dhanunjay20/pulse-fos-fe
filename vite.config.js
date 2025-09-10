import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://pulse-620964158368.asia-south2.run.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
