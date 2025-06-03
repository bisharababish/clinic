import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps in production for smaller build
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for all node_modules
          vendor: ['react', 'react-dom', 'react-router-dom'],

          // UI chunk for UI components
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            'lucide-react'
          ],

          // Charts chunk for chart libraries
          charts: ['recharts'],

          // Supabase chunk
          supabase: ['@supabase/supabase-js'],

          // Admin chunk for admin-related components
          admin: [
            './src/pages/AdminDashboard',
            './src/pages/api/admin/AppointmentsManagement',
            './src/pages/api/admin/ClinicManagement',
            './src/pages/api/admin/DoctorManagement',
            './src/pages/api/admin/OverviewManagement',
            './src/pages/api/admin/UsersManagement'
          ],

          // Date utilities
          date: ['date-fns'],

          // Internationalization
          i18n: ['react-i18next', 'i18next'],

          // Animation libraries
          animation: ['framer-motion']
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk'
          return `js/${facadeModuleId}-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    },
    // Increase chunk size warning limit to 1000kb
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js'
    ],
  },
})