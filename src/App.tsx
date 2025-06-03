import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
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
            
            {/* Home - accessible to all authenticated users */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor", "secretary", "nurse", "lab", "x ray", "patient"]}>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* About Us - accessible to admin and patient only */}
            <Route
              path="/about"
              element={
                <ProtectedRoute allowedRoles={["admin", "patient"]}>
                  <MainLayout>
                    <AboutUs />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Clinics - accessible to admin, secretary, nurse, patient */}
            <Route
              path="/clinics"
              element={
                <ProtectedRoute allowedRoles={["admin", "secretary", "nurse", "patient"]}>
                  <MainLayout>
                    <Clinics />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Payment - accessible to all authenticated users who can book appointments */}
            <Route
              path="/payment"
              element={
                <ProtectedRoute allowedRoles={["admin", "secretary", "patient"]}>
                  <MainLayout>
                    <Payment />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Confirmation - accessible to all authenticated users who can book appointments */}
            <Route
              path="/confirmation"
              element={
                <ProtectedRoute allowedRoles={["admin", "secretary", "patient"]}>
                  <MainLayout>
                    <Confirmation />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Labs - accessible to admin, doctor, lab ONLY */}
            <Route
              path="/labs"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor", "lab"]}>
                  <MainLayout>
                    <Labs />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* X-Ray - accessible to admin, doctor, x ray ONLY */}
            <Route
              path="/xray"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor", "x ray"]}>
                  <MainLayout>
                    <XRay />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard - accessible to admin and secretary */}
            {/* Secretary will be limited to appointments tab only within the dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin", "secretary"]}>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect unknown routes to home */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <Navigate to="/" replace />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;