import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect, useState } from "react";
import { createDefaultAdmin, migrateExistingUsers } from "./lib/migrateUsers";

// Pages
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Index from "./pages/Index";
import AboutUs from "./pages/Aboutus";
import Clinics from "./pages/Clinics";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import Labs from "./pages/Labs";
import XRay from "./pages/XRay";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
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
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;