import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "./components/layout/MainLayout";
import { HeaderOnlyLayout } from "./components/layout/HeaderOnlyLayout";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useEffect, useState, Suspense, lazy } from "react";
import { getDefaultRouteForRole } from "./lib/rolePermissions";

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

// ✅ FIXED: Import the new doctor pages
const DoctorLabsPage = lazy(() => import("./pages/DoctorLabsPage"));
const DoctorXRayPage = lazy(() => import("./pages/DoctorXRayPage"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Home Route with Role-Based Redirect
function HomeRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    const userRole = user.role?.toLowerCase();
    const defaultRoute = getDefaultRouteForRole(userRole);

    // If the user is on the root path and their default route is not root, redirect them.
    // This prevents redirect loops if the default route is '/' and the user is already there.
    if (location.pathname === '/' && defaultRoute !== '/') {
      console.log(`User ${userRole} at home, redirecting to: ${defaultRoute}`);
      navigate(defaultRoute, { replace: true });
      return;
    }

  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <Index />
    </MainLayout>
  );
}

// Default Redirect Component for unknown routes
function DefaultRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const defaultRoute = getDefaultRouteForRole(user.role);
  console.log(`Unknown route accessed by ${user.role}, redirecting to: ${defaultRoute}`);
  return <Navigate to={defaultRoute} replace />;
}

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  if (isInitializing) {
    return <PageLoader />;
  }

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-4">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
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
                <ProtectedRoute allowedRoles={["admin", "doctor", "secretary", "nurse", "patient"]}>
                  <HomeRoute />
                </ProtectedRoute>
              }
            />

            {/* About Us - accessible to admin and patient only */}
            <Route
              path="/about"
              element={
                <ProtectedRoute allowedRoles={["admin", "patient"]}>
                  <HeaderOnlyLayout>
                    <AboutUs />
                  </HeaderOnlyLayout>
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
                  <HeaderOnlyLayout>
                    <Payment />
                  </HeaderOnlyLayout>
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

            {/* Labs - accessible to admin, lab, doctor */}
            <Route
              path="/labs"
              element={
                <ProtectedRoute allowedRoles={["admin", "lab", "doctor"]}>
                  <HeaderOnlyLayout>
                    <Labs />
                  </HeaderOnlyLayout>
                </ProtectedRoute>
              }
            />

            {/* X-Ray - accessible to admin, xray, doctor */}
            <Route
              path="/xray"
              element={
                <ProtectedRoute allowedRoles={["admin", "xray", "doctor"]}>
                  <HeaderOnlyLayout>
                    <XRay />
                  </HeaderOnlyLayout>
                </ProtectedRoute>
              }
            />

            {/* Doctor Labs - accessible to admin, doctor */}
            <Route
              path="/doctor/labs"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                  <HeaderOnlyLayout>
                    <DoctorLabsPage />
                  </HeaderOnlyLayout>
                </ProtectedRoute>
              }
            />

            {/* Doctor X-Ray - accessible to admin, doctor */}
            <Route
              path="/doctor/xray"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                  <HeaderOnlyLayout>
                    <DoctorXRayPage />
                  </HeaderOnlyLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard - accessible to admin and secretary */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin", "secretary"]}>
                  <HeaderOnlyLayout>
                    <AdminDashboard />
                  </HeaderOnlyLayout>
                </ProtectedRoute>
              }
            />


            {/* Catch all route - redirect to user's default route based on role */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <DefaultRedirect />
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