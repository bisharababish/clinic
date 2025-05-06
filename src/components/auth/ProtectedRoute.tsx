// Modified ProtectedRoute.tsx - Improved navigation handling
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  console.log("Protected route check - User:", user, "Loading:", isLoading); // Debug log

  // Check for loginSuccess flag
  useEffect(() => {
    const loginSuccess = localStorage.getItem('loginSuccess');
    if (loginSuccess === 'true' && user) {
      // Clear the flag
      localStorage.removeItem('loginSuccess');
      // Force navigation to current path to refresh the page if needed
      const currentPath = location.pathname;
      console.log("Login success flag found, refreshing page at", currentPath);
      navigate(currentPath, { replace: true });
    }
  }, [user, navigate, location.pathname]);

  // Show loading state if still checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If not logged in, redirect to login page
  if (!user) {
    console.log("User not authenticated, redirecting to auth"); // Debug log
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If no specific roles are required, or if user has an allowed role, render the page
  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // If user doesn't have permission, redirect to unauthorized page or home
  console.log("User doesn't have required role:", user.role, "Required:", allowedRoles); // Debug log
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;