import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    allowedHosts: [
      'sales.webbuild.arachnova.id',
      'webbuild.arachnova.id',
      '.webbuild.arachnova.id',
      '.arachnova.id',
      'localhost',
      '127.0.0.1',
      '103.175.218.159'
    ]
  }
})
