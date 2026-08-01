import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/family-api': {
        target: 'http://nginx:80',
        rewrite: (path) => path.replace(/^\/family-api/, ''),
      },
      '/meal-api': {
        target: 'http://host.docker.internal:10001',
        rewrite: (path) => path.replace(/^\/meal-api/, ''),
      },
      '/cookbook-api': {
        target: 'http://host.docker.internal:10000',
        rewrite: (path) => path.replace(/^\/cookbook-api/, ''),
      },
    },
  },
})

