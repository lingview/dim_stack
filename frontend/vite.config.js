import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '^/api/.*': {
        target: 'http://127.0.0.1:2222',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    minify: 'esbuild',
  },
  esbuild: {
    drop: ['console'],
  },
})
