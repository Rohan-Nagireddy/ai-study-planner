import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ── Dev server ─────────────────────────────────────────
  server: {
    port: 5173,
    strictPort: true,
  },

  // ── Production build ────────────────────────────────────
  build: {
    outDir: 'dist',          // Vercel/Netlify default
    sourcemap: false,        // Smaller bundle in prod
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          axios: ['axios'],
        },
      },
    },
  },
})
