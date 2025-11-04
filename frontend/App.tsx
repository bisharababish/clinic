import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { MainLayout } from "./components/layout/MainLayout";
import { HeaderOnlyLayout } from "./components/layout/HeaderOnlyLayout";
import { AuthProvider } from "./hooks/useAuth";
import { AdminStateProvider } from "./hooks/useAdminState";
import React, { Suspense, lazy } from "react";
import { Skeleton } from "./components/ui/skeleton";
import CookieConsent from "react-cookie-consent";
import { useLegalModals, PrivacyPolicyModal } from "./components/modals/LegalModals";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { HelmetProvider } from "react-helmet-async";
import './src/lib/sentry';

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
const Ultrasound = lazy(() => import("./pages/Ultrasound"));
const Audiometry = lazy(() => import("./pages/Audiometry"));
const NotFound = lazy(() => import("./pages/NotFound"));
// const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
import AdminDashboard from "./pages/AdminDashboard";
const DoctorLabsPage = lazy(() => import("./pages/DoctorLabsPage"));
const DoctorXRayPage = lazy(() => import("./pages/DoctorXRayPage"));
const DoctorUltrasoundPage = lazy(() => import("./pages/DoctorUltrasoundPage"));
const DoctorAudiometryPage = lazy(() => import("./pages/DoctorAudiometryPage"));
const DoctorPatientsPage = lazy(() => import("./pages/DoctorPatientPage"));
const PatientDashboardPage = lazy(() => import("./pages/PatientDashboard"));
const UserPreviewPage = lazy(() => import("./pages/UserPreviewPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Skeleton width={48} height={48} circle className="mx-auto mb-4" />
      <Skeleton width={120} height={20} className="mx-auto" />
    </div>
  </div>
);

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

function App() {
  const { privacyOpen, openPrivacy, closePrivacy } = useLegalModals();

  return (
    <HelmetProvider>
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

                  {/* Root route - redirect to auth */}
                  <Route
                    path="/"
                    element={<Auth />}
                  />

                  {/* Home/Dashboard route */}
                  <Route
                    path="/home"
                    element={
                      <MainLayout>
                        <Index />
                      </MainLayout>
                    }
                  />

                  {/* Clinics */}
                  <Route
                    path="/clinics"
                    element={
                      <MainLayout>
                        <Clinics />
                      </MainLayout>
                    }
                  />

                  {/* Payment */}
                  <Route
                    path="/payment"
                    element={
                      <HeaderOnlyLayout>
                        <Payment />
                      </HeaderOnlyLayout>
                    }
                  />

                  {/* Confirmation */}
                  <Route
                    path="/confirmation"
                    element={
                      <MainLayout>
                        <Confirmation />
                      </MainLayout>
                    }
                  />

                  {/* Labs */}
                  <Route
                    path="/labs"
                    element={
                      <HeaderOnlyLayout>
                        <Labs />
                      </HeaderOnlyLayout>
                    }
                  />

                  {/* X-Ray */}
                  <Route
                    path="/xray"
                    element={
                      <HeaderOnlyLayout>
                        <XRay />
                      </HeaderOnlyLayout>
                    }
                  />

                  {/* Ultrasound */}
                  <Route
                    path="/ultrasound"
                    element={
                      <HeaderOnlyLayout>
                        <Ultrasound />
                      </HeaderOnlyLayout>
                    }
                  />

                  {/* Audiometry */}
                  <Route
                    path="/audiometry"
                    element={
                      <HeaderOnlyLayout>
                        <Audiometry />
                      </HeaderOnlyLayout>
                    }
                  />

                  {/* Doctor Labs */}
                  <Route
                    path="/doctor/labs"
                    element={
                      <HeaderOnlyLayout>
                        <DoctorLabsPage />
                      </HeaderOnlyLayout>
                    }
                  />

                  {/* Doctor X-Ray */}
                  <Route
                    path="/doctor/xray"
                    element={
                      <HeaderOnlyLayout>
                        <DoctorXRayPage />
                      </HeaderOnlyLayout>
                    }
                  />

                  {/* Doctor Ultrasound */}
                  <Route
                    path="/doctor/ultrasound"
                    element={
                      <HeaderOnlyLayout>
                        <DoctorUltrasoundPage />
                      </HeaderOnlyLayout>
                    }
                  />

                  {/* Doctor Audiometry */}
                  <Route
                    path="/doctor/audiometry"
                    element={
                      <HeaderOnlyLayout>
                        <DoctorAudiometryPage />
                      </HeaderOnlyLayout>
                    }
                  />

                  {/* Doctor Patients */}
                  <Route
                    path="/doctor/patients"
                    element={
                      <HeaderOnlyLayout>
                        <DoctorPatientsPage />
                      </HeaderOnlyLayout>
                    }
                  />

                  {/* Patient Dashboard */}
                  <Route
                    path="/patient/dashboard"
                    element={
                      <MainLayout>
                        <PatientDashboardPage />
                      </MainLayout>
                    }
                  />

                  {/* User Preview Mode - Medical Records */}
                  <Route
                    path="/preview"
                    element={
                      <MainLayout>
                        <UserPreviewPage />
                      </MainLayout>
                    }
                  />

                  {/* Admin Dashboard */}
                  <Route
                    path="/admin/*"
                    element={
                      <HeaderOnlyLayout>
                        <AdminDashboard />
                      </HeaderOnlyLayout>
                    }
                  />

                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Router>
          </GlobalErrorBoundary>
        </AdminStateProvider>
      </AuthProvider>
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
    </HelmetProvider>
  );
}

export default App;
