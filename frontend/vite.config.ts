import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      port: 3001,
    },
    watch: {
      usePolling: true,
    },
  },
  preview: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    copyPublicDir: true,
    minify: 'esbuild', // ⚡ MUCH faster than terser
    sourcemap: false, // Disable sourcemaps in production
    // Remove terser options for faster build
  },
  // Service Worker configuration
  define: {
    // Fix for framer-motion and other libraries that check for DOM
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // Ensure proper environment variable access
    'import.meta.env.DEV': JSON.stringify(process.env.NODE_ENV !== 'production'),
    // Service Worker support
    'import.meta.env.SW': JSON.stringify(true),
  },
  base: '/',
  publicDir: 'public'
})
