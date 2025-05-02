// components/auth/ProtectedRoute.tsx
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log("Protected route check - User:", user, "Loading:", isLoading); // Debug log

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