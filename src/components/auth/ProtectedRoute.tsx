// components/auth/ProtectedRoute.tsx
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasDirectAuth, setHasDirectAuth] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Check for direct authentication state without relying on the hook
  useEffect(() => {
    const checkAuthDirectly = async () => {
      try {
        // First check if login is in progress
        const loginInProgress = sessionStorage.getItem('login_in_progress');
        if (loginInProgress === 'true') {
          console.log('Login in progress, allowing temporary access');
          setHasDirectAuth(true);
          setIsCheckingAuth(false);
          return;
        }

        // Check for admin login success flag
        const adminLoginSuccess = sessionStorage.getItem('admin_login_success');
        if (adminLoginSuccess === 'true') {
          console.log('Admin login flag detected, allowing access');
          setHasDirectAuth(true);
          setUserRole('admin');
          setIsCheckingAuth(false);
          return;
        }

        // Check localStorage for cached user profile
        const cachedUserProfile = localStorage.getItem('clinic_user_profile');
        if (cachedUserProfile) {
          console.log('Found cached user profile');
          const userObj = JSON.parse(cachedUserProfile);
          setUserRole(userObj.role as UserRole);
          setHasDirectAuth(true);
          setIsCheckingAuth(false);
          return;
        }

        // Check Supabase session directly
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error checking auth directly:', error);
          setHasDirectAuth(false);
          setIsCheckingAuth(false);
          return;
        }

        if (data && data.session) {
          console.log('Direct auth check: User is authenticated');
          // Try to get user profile from database
          const { data: userData, error: userError } = await supabase
            .from('userinfo')
            .select('*')
            .ilike('user_email', data.session.user.email || '')
            .single();

          if (!userError && userData) {
            setUserRole(userData.user_roles.toLowerCase() as UserRole);
          } else {
            setUserRole('patient'); // Default role
          }

          setHasDirectAuth(true);
        } else {
          console.log('Direct auth check: No session found');
          setHasDirectAuth(false);
        }
      } catch (error) {
        console.error('Unexpected error in direct auth check:', error);
        setHasDirectAuth(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthDirectly();
  }, [location.pathname]);

  // Show loading state if still checking authentication
  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // IMPORTANT: Check both context user and direct auth
  if (!user && !hasDirectAuth) {
    console.log("No authentication detected, redirecting to auth page");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If we get here, user is authenticated - check roles if needed
  if (allowedRoles.length > 0) {
    // Get role from user context, our direct check, or cached profile
    const effectiveRole: UserRole = userRole || (user ? user.role : 'patient');

    if (!allowedRoles.includes(effectiveRole)) {
      console.log("User doesn't have required role:", effectiveRole, "Required:", allowedRoles);
      return <Navigate to="/" replace />;
    }
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;