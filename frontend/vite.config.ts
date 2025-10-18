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
  define: {
    // Fix for framer-motion and other libraries that check for DOM
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // Ensure proper environment variable access
    'import.meta.env.DEV': JSON.stringify(process.env.NODE_ENV !== 'production'),
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
      output: {}
    },
    // Increase chunk size warning limit since we're optimizing
    chunkSizeWarningLimit: 1000,
    copyPublicDir: true,
    // Add this to ensure proper environment handling
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
  },
  base: '/',
  publicDir: 'public'
})
