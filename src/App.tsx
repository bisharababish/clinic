import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect, useState, Suspense, lazy } from "react";
import { createDefaultAdmin, migrateExistingUsers } from "./lib/migrateUsers";

// Lazy load components for code splitting
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Index = lazy(() => import("./pages/Index"));
const AboutUs = lazy(() => import("./pages/Aboutus"));
const Clinics = lazy(() => import("./pages/Clinics"));
const Payment = lazy(() => import("./pages/Payment"));
const Confirmation = lazy(() => import("./pages/Confirmation"));
const Labs = lazy(() => import("./pages/Labs"));
const XRay = lazy(() => import("./pages/XRay"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Create default admin and migrate existing users
        await createDefaultAdmin();
        // Comment this out after first run to avoid unnecessary API calls
        // await migrateExistingUsers();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  if (isInitializing) {
    return <PageLoader />;
  }

  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected routes with MainLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AboutUs />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/clinics"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Clinics />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Payment />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/confirmation"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Confirmation />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Role-protected routes */}
            <Route
              path="/labs"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor", "secretary"]}>
                  <MainLayout>
                    <Labs />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/xray"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor", "secretary"]}>
                  <MainLayout>
                    <XRay />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;