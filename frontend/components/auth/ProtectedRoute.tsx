// components/auth/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  fallbackPath = '/'
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  console.log("[ProtectedRoute] Render. isLoading:", isLoading, "user:", user, "location:", location.pathname);

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    console.log("[ProtectedRoute] Still loading auth, showing spinner.");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    console.log("[ProtectedRoute] User not authenticated, redirecting to /auth.");
    // Store the attempted URL for redirect after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If no specific roles are required, allow any authenticated user
  if (allowedRoles.length === 0) {
    console.log("[ProtectedRoute] No specific roles required, allowing access.");
    return <>{children}</>;
  }

  // Check if user's role is in the allowed roles
  const userRole = user.role?.toLowerCase()?.trim();
  console.log("[ProtectedRoute] Checking permissions for user role:", userRole, "Allowed roles:", allowedRoles);

  // Handle special case for x-ray role (normalize different variations)
  const normalizedUserRole = userRole === 'xray' || userRole === 'x-ray' ? 'x ray' : userRole;

  // Normalize allowed roles for comparison
  const normalizedAllowedRoles = allowedRoles.map(role => {
    const lowerRole = role.toLowerCase().trim();
    return lowerRole === 'xray' || lowerRole === 'x-ray' ? 'x ray' : lowerRole;
  });

  const hasPermission = normalizedAllowedRoles.includes(normalizedUserRole || '');
  console.log("[ProtectedRoute] User has permission:", hasPermission);

  // If user doesn't have permission, redirect to fallback path
  if (!hasPermission) {
    // Log for debugging
    console.warn(`Access denied for user role "${userRole}" to route requiring roles: [${allowedRoles.join(', ')}]`);
    console.log("[ProtectedRoute] Access denied, redirecting to fallback path:", fallbackPath);
    return <Navigate to={fallbackPath} replace />;
  }

  // User is authenticated and has permission, render the protected component
  console.log("[ProtectedRoute] User authenticated and has permission, rendering children.");
  return <>{children}</>;
};

// Also export as default for backward compatibility
export default ProtectedRoute;
