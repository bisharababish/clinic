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
        
        // Check localStorage for cached user profile
        const cachedUserProfile = localStorage.getItem('clinic_user_profile');
        if (cachedUserProfile) {
          console.log('Found cached user profile');
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

  console.log("Protected route check - User from context:", user, "Loading:", isLoading, "Direct Auth:", hasDirectAuth);

  // Show loading state if still checking authentication
  if (isLoading || isCheckingAuth) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // IMPORTANT: Check both context user and direct auth
  // This fixes the redirect issue since we're not just relying on the context
  if (!user && !hasDirectAuth) {
    console.log("No authentication detected, redirecting to auth page");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If we get here, user is authenticated - check roles if needed
  if (allowedRoles.length > 0) {
    // Get role from user context or cached profile
    let userRole: UserRole = 'patient'; // Default
    
    if (user) {
      userRole = user.role;
    } else {
      // Try to get role from cached profile
      const cachedProfile = localStorage.getItem('clinic_user_profile');
      if (cachedProfile) {
        try {
          const parsed = JSON.parse(cachedProfile);
          userRole = parsed.role as UserRole;
        } catch (e) {
          console.error('Error parsing cached profile:', e);
        }
      }
    }
    
    if (!allowedRoles.includes(userRole)) {
      console.log("User doesn't have required role:", userRole, "Required:", allowedRoles);
      return <Navigate to="/" replace />;
    }
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;