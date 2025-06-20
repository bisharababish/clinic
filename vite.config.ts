import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split node_modules into separate chunks
          if (id.includes('node_modules')) {
            // React and React DOM
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Charts/visualization libraries
            if (id.includes('chart') || id.includes('recharts') || id.includes('d3')) {
              return 'charts-vendor';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'forms-vendor';
            }
            // Date libraries
            if (id.includes('date-fns') || id.includes('moment') || id.includes('dayjs')) {
              return 'date-vendor';
            }
            // HTTP/API libraries
            if (id.includes('axios') || id.includes('fetch')) {
              return 'http-vendor';
            }
            // Other vendor libraries
            return 'vendor';
          }

          // Split your large components
          if (id.includes('AdminDashboard')) {
            return 'admin';
          }
          if (id.includes('Auth')) {
            return 'auth';
          }
          if (id.includes('XRay')) {
            return 'xray';
          }
        }
      },
    },
    copyPublicDir: true,
  },
  base: '/',
  publicDir: 'public'
})