import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://127.0.0.1:2222';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '^/api/.*': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '^/file/.*': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      minify: 'esbuild',
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash].[ext]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('pdfjs-dist') || id.includes('react-pdf')) return 'pdf';
            if (id.includes('react-syntax-highlighter') || id.includes('refractor')) return 'syntax-highlight';
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'animation';
            if (id.includes('docx-preview') || id.includes('jszip')) return 'docx';
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/') || id.includes('scheduler')) return 'react-vendor';
          },
        },
      },
    },
    esbuild: {
      drop: ['console'],
    },
  };
});