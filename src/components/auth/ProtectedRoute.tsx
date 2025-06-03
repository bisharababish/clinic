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
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // Check for direct authentication state without relying on the hook
  useEffect(() => {
    const checkAuthDirectly = async () => {
      try {
        console.log('Starting auth check...');

        // First check if login is in progress
        const loginInProgress = sessionStorage.getItem('login_in_progress');
        if (loginInProgress === 'true') {
          console.log('Login in progress, allowing temporary access');
          setHasDirectAuth(true);
          setIsCheckingAuth(false);
          setAuthCheckComplete(true);
          return;
        }

        // Check for admin login success flag
        const adminLoginSuccess = sessionStorage.getItem('admin_login_success');
        if (adminLoginSuccess === 'true') {
          console.log('Admin login flag detected, allowing access');
          setHasDirectAuth(true);
          setUserRole('admin');
          setIsCheckingAuth(false);
          setAuthCheckComplete(true);
          return;
        }

        // Check localStorage for cached user profile
        const cachedUserProfile = localStorage.getItem('clinic_user_profile');
        if (cachedUserProfile) {
          try {
            console.log('Found cached user profile');
            const userObj = JSON.parse(cachedUserProfile);
            setUserRole(userObj.role as UserRole);
            setHasDirectAuth(true);
            setIsCheckingAuth(false);
            setAuthCheckComplete(true);
            return;
          } catch (parseError) {
            console.error('Error parsing cached user profile:', parseError);
            // Continue to Supabase check
          }
        }

        // Check Supabase session directly with timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 5000)
        );

        const authPromise = supabase.auth.getSession();

        const result = await Promise.race([authPromise, timeoutPromise]) as Awaited<ReturnType<typeof supabase.auth.getSession>>;
        const { data, error } = result;

        if (error) {
          console.error('Error checking auth directly:', error);
          setHasDirectAuth(false);
          setIsCheckingAuth(false);
          setAuthCheckComplete(true);
          return;
        }

        if (data && data.session) {
          console.log('Direct auth check: User is authenticated');
          // Try to get user profile from database with timeout
          try {
            const userDataPromise = supabase
              .from('userinfo')
              .select('*')
              .ilike('user_email', data.session.user.email || '')
              .single();

            const userTimeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('User data timeout')), 3000)
            );

            const userResult = await Promise.race([
              userDataPromise,
              userTimeoutPromise
            ]) as
              | { data: { user_roles: string } | null; error: Error | null }
              | never;

            const userData = (userResult as { data: { user_roles: string } | null }).data;
            const userError = (userResult as { error: Error | null }).error;

            if (!userError && userData) {
              setUserRole(userData.user_roles.toLowerCase() as UserRole);
            } else {
              console.log('Using default role due to user data error:', userError);
              setUserRole('patient'); // Default role
            }
          } catch (userFetchError) {
            console.error('Error fetching user data:', userFetchError);
            setUserRole('patient'); // Default role on error
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
        setAuthCheckComplete(true);
      }
    };

    // Add a maximum timeout for the entire auth check
    const maxTimeout = setTimeout(() => {
      console.warn('Auth check taking too long, proceeding with default state');
      setIsCheckingAuth(false);
      setAuthCheckComplete(true);
      setHasDirectAuth(false);
    }, 8000);

    checkAuthDirectly().finally(() => {
      clearTimeout(maxTimeout);
    });

    return () => {
      clearTimeout(maxTimeout);
    };
  }, [location.pathname]);

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute state:', {
      isLoading,
      isCheckingAuth,
      authCheckComplete,
      user: !!user,
      hasDirectAuth,
      userRole
    });
  }, [isLoading, isCheckingAuth, authCheckComplete, user, hasDirectAuth, userRole]);

  // Show loading state if still checking authentication
  if (isLoading || (isCheckingAuth && !authCheckComplete)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="mt-2 text-sm text-gray-400">
            Auth: {isLoading ? 'Loading...' : 'Ready'} |
            Check: {isCheckingAuth ? 'Checking...' : 'Complete'}
          </p>
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
  console.log("Rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;