import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Bind to all network interfaces
    port: 5173,
    // Disable host check for domain access (Vite 7+)
    allowedHosts: [
      'webbuild.arachnova.id',
      '.webbuild.arachnova.id',  // Wildcard for subdomains
      'localhost',
      '103.175.218.159',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
