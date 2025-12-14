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
  optimizeDeps: {
    exclude: ['bcrypt', 'bcryptjs'], // Exclude bcrypt packages (not needed for browser)
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove these functions
      },
    },
    sourcemap: false, // Disable sourcemaps in production
  },
  base: '/',
  publicDir: 'public'
})
