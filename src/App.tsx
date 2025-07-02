import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "./components/layout/MainLayout";
import { HeaderOnlyLayout } from "./components/layout/HeaderOnlyLayout";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useEffect, useState, Suspense, lazy } from "react";
import { getDefaultRouteForRole } from "./lib/rolePermissions";
import { supabase } from "./lib/supabase";
import React from "react";

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
let globalSubscriptions: { [key: string]: ReturnType<typeof supabase.channel> | null } = {};


const initializeGlobalSubscriptions = () => {
  Object.values(globalSubscriptions).forEach(sub => {
    if (sub) sub.unsubscribe();
  });
  globalSubscriptions = {};

  console.log("🔄 Initializing global subscriptions...");

  globalSubscriptions.users = supabase
    .channel('global-users-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'userinfo' },
      (payload) => {
        console.log('Global users change:', payload);
        window.dispatchEvent(new CustomEvent('users-updated', { detail: payload }));
      }
    )
    .subscribe();
};

const cleanupGlobalSubscriptions = () => {
  Object.values(globalSubscriptions).forEach(sub => {
    if (sub) sub.unsubscribe();
  });
  globalSubscriptions = {};
};
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
// Home Route with Role-Based Redirect
function HomeRoute() {
  const { user } = useAuth();

  // If no user, don't render anything (ProtectedRoute will handle redirect)
  if (!user) {
    return null;
  }

  // Just render the home page - no redirects here
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

// Global Error Boundary
class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Global error boundary caught: ", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-red-600 mb-4">Something went wrong. Please refresh the page.</p>
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
    return this.props.children;
  }
}

// AuthLoadingGate: Shows a loading spinner if auth is loading
function AuthLoadingGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return <>{children}</>;
}

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize global subscriptions
        initializeGlobalSubscriptions();

        // Add a timeout to prevent infinite loading
        setTimeout(() => {
          if (isInitializing) {
            console.log("App initialization timeout, proceeding anyway");
            setIsInitializing(false);
          }
        }, 3000); // 3 second max wait

        // Your existing initialization logic
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error('Error initializing app:', error);
        setInitError('Failed to initialize application. Please refresh the page.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      cleanupGlobalSubscriptions();
    };
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
      <GlobalErrorBoundary>
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
                    <AuthLoadingGate>
                      <HomeRoute />
                    </AuthLoadingGate>
                  </ProtectedRoute>
                }
              />

              {/* About Us - accessible to admin and patient only */}
              <Route
                path="/about"
                element={
                  <ProtectedRoute allowedRoles={["admin", "patient"]}>
                    <AuthLoadingGate>
                      <HeaderOnlyLayout>
                        <AboutUs />
                      </HeaderOnlyLayout>
                    </AuthLoadingGate>
                  </ProtectedRoute>
                }
              />

              {/* Clinics - accessible to admin, secretary, nurse, patient */}
              <Route
                path="/clinics"
                element={
                  <ProtectedRoute allowedRoles={["admin", "secretary", "nurse", "patient"]}>
                    <AuthLoadingGate>
                      <MainLayout>
                        <Clinics />
                      </MainLayout>
                    </AuthLoadingGate>
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
      </GlobalErrorBoundary>
      <Toaster />
    </AuthProvider>
  );
}

export default App;