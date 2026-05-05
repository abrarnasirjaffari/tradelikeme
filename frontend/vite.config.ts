import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/auth': {
        target: 'https://auth.tradelikeme.xyz',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
