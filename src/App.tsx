// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DatabaseSync from "./hooks/DatabaseSync";

// Pages
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
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
  return (
    <AuthProvider>
      <Router>
        <DatabaseSync />
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />

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