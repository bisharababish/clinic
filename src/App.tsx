import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "./components/layout/MainLayout";
import { HeaderOnlyLayout } from "./components/layout/HeaderOnlyLayout";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useEffect, useState, Suspense, lazy } from "react";
import { getDefaultRouteForRole } from "./lib/rolePermissions";
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

// ✅ FIXED: Import the new doctor pages
const DoctorLabsPage = lazy(() => import("./pages/DoctorLabsPage"));
const DoctorXRayPage = lazy(() => import("./pages/DoctorXRayPage"));

// Enhanced Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error Boundary Component - CRITICAL FIX
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-red-600 mb-4">
              The application encountered an error. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-600">Error Details</summary>
                <pre className="mt-2 text-xs text-red-500 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
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

// Home Route with Role-Based Redirect - FIXED
function HomeRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Use useEffect instead of useLayoutEffect to prevent timing issues
  useEffect(() => {
    setMounted(true);

    // Don't redirect if we already have or if component is unmounting
    if (hasRedirected || !mounted) return;

    if (!user) {
      navigate('/auth', { replace: true });
      setHasRedirected(true);
      return;
    }

    const userRole = user.role?.toLowerCase();
    const defaultRoute = getDefaultRouteForRole(userRole);
    const currentPath = window.location.pathname;

    // Only redirect if we're on root and default route is different
    if (currentPath === '/' && defaultRoute !== '/') {
      console.log(`User ${userRole} at home, redirecting to: ${defaultRoute}`);
      navigate(defaultRoute, { replace: true });
      setHasRedirected(true);
    }

    // Cleanup function
    return () => {
      setMounted(false);
    };
  }, [user, navigate, mounted, hasRedirected]);

  // Show loader while determining redirect
  if (!mounted || !user) {
    return <PageLoader />;
  }

  return (
    <MainLayout>
      <Index />
    </MainLayout>
  );
}

// Default Redirect Component for unknown routes - FIXED
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
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Create default admin and migrate existing users
        await createDefaultAdmin();
        // Comment this out after first run to avoid unnecessary API calls
        // await migrateExistingUsers();
      } catch (error) {
        console.error('Error initializing app:', error);
        setInitError('Failed to initialize application. Please refresh the page.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;