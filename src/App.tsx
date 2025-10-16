import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "./components/layout/MainLayout";
import { HeaderOnlyLayout } from "./components/layout/HeaderOnlyLayout";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AdminStateProvider } from "./hooks/useAdminState";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useEffect, useState, Suspense, lazy } from "react";
import { getDefaultRouteForRole } from "./lib/rolePermissions";
import { supabase } from "./lib/supabase";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CookieConsent from "react-cookie-consent";
import { useLegalModals, PrivacyPolicyModal } from "../src/components/modals/LegalModals";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { useScrollToTop } from "./hooks/useScrollToTop";

// Scroll to top component that works inside Router context
function ScrollToTop() {
  useScrollToTop();
  return null;
}

// Lazy load components for code splitting
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Index = lazy(() => import("./pages/Index"));
const Clinics = lazy(() => import("./pages/Clinics"));
const Payment = lazy(() => import("./pages/Payment"));
const Confirmation = lazy(() => import("./pages/Confirmation"));
const Labs = lazy(() => import("./pages/Labs"));
const XRay = lazy(() => import("./pages/XRay"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DoctorLabsPage = lazy(() => import("./pages/DoctorLabsPage"));
const DoctorXRayPage = lazy(() => import("./pages/DoctorXRayPage"));
const DoctorPatientsPage = lazy(() => import("./pages/DoctorPatientPage"));
const PatientDashboardPage = lazy(() => import("./pages/PatientDashboard"));




const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Skeleton width={48} height={48} circle className="mx-auto mb-4" />
      <Skeleton width={120} height={20} className="mx-auto" />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function HomeRoute() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <Index />
    </MainLayout>
  );
}

function DefaultRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const defaultRoute = getDefaultRouteForRole(user.role);
  console.log(`Unknown route accessed by ${user.role}, redirecting to: ${defaultRoute}`);
  return <Navigate to={defaultRoute} replace />;
}

class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: unknown }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }
  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
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
  const { privacyOpen, openPrivacy, closePrivacy } = useLegalModals();


  useEffect(() => {
    const initializeApp = async () => {
      try {

        setTimeout(() => {
          if (isInitializing) {
            console.log("App initialization timeout, proceeding anyway");
            setIsInitializing(false);
          }
        }, 3000);

        await new Promise(resolve => setTimeout(resolve, 100));

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

    <AuthProvider>
      <AdminStateProvider>
        <GlobalErrorBoundary>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <ScrollToTop />
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
                <Route
                  path="/doctor/patients"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                      <HeaderOnlyLayout>
                        <DoctorPatientsPage />
                      </HeaderOnlyLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Patient Dashboard - accessible to patients only */}
                <Route
                  path="/patient/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <MainLayout>
                        <PatientDashboardPage />
                      </MainLayout>
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
        <CookieConsent
          location="bottom"
          buttonText="Accept All Cookies"
          declineButtonText="Decline"
          enableDeclineButton
          cookieName="bethlehem-med-center-cookies"
          style={{
            background: "#1f2937",
            fontSize: "14px",
            padding: "20px"
          }}
          buttonStyle={{
            background: "#3b82f6",
            color: "white",
            fontSize: "14px",
            borderRadius: "6px",
            padding: "8px 16px",
            border: "none"
          }}
          declineButtonStyle={{
            background: "transparent",
            color: "#9ca3af",
            fontSize: "14px",
            borderRadius: "6px",
            padding: "8px 16px",
            border: "1px solid #6b7280"
          }}
          expires={365}
          overlay
        >
          🍪 We use cookies to improve your experience on our website. By continuing to browse, you agree to our use of cookies for analytics and personalized content.{" "}
          <button onClick={openPrivacy} style={{ color: "#60a5fa", textDecoration: "underline", background: "none", border: "none" }}>
            Privacy Policy
          </button>
        </CookieConsent>
        <PrivacyPolicyModal isOpen={privacyOpen} onClose={closePrivacy} />
      </AdminStateProvider>
    </AuthProvider>

  );
}

export default App;