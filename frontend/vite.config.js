// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
      react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '^/api/.*': {
        target: 'http://192.168.1.6:2222',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
