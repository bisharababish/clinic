import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // CRITICAL: Ensure single React version
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    // Dedupe React to prevent multiple versions
    dedupe: ['react', 'react-dom'],
  },
  define: {
    // Ensure React is available globally
    global: 'globalThis',
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
          // Split node_modules into specific vendor chunks
          if (id.includes('node_modules')) {
            // React core - CRITICAL: Keep React together
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // Supabase
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'supabase-vendor';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            // Other vendor libraries
            return 'vendor';
          }

          // Your app chunks (same as before)
          if (id.includes('AdminDashboard') ||
            id.includes('pages/api/admin/') ||
            id.includes('OverviewManagement') ||
            id.includes('UsersManagement') ||
            id.includes('ClinicManagement') ||
            id.includes('DoctorManagement') ||
            id.includes('AppointmentsManagement') ||
            id.includes('PatientHealthManagement')) {
            return 'admin-dashboard';
          }

          if (id.includes('pages/api/admin/')) {
            return 'admin-components';
          }

          if (id.includes('pages/Index') || id.includes('usePatientHealth')) {
            return 'index-page';
          }

          if (id.includes('pages/Auth') ||
            id.includes('LoginForm') ||
            id.includes('RegisterForm') ||
            id.includes('ForgotPasswordForm')) {
            return 'auth';
          }

          if (id.includes('DoctorLabsPage') || id.includes('DoctorXRayPage')) {
            return 'doctor-pages';
          }

          if (id.includes('pages/Labs') || id.includes('pages/XRay')) {
            return 'lab-xray-pages';
          }

          if (id.includes('pages/Clinics') || id.includes('pages/Payment')) {
            return 'clinic-payment-pages';
          }

          if (id.includes('components/ui/')) {
            return 'ui-components';
          }

          if (id.includes('components/layout/')) {
            return 'layout-components';
          }

          if (id.includes('hooks/')) {
            return 'hooks';
          }

          if (id.includes('lib/') || id.includes('utils/')) {
            return 'utils';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    copyPublicDir: true,
  },
  base: '/',
  publicDir: 'public'
})