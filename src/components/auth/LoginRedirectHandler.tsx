// components/auth/LoginRedirectHandler.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDefaultRouteForRole } from '../../lib/rolePermissions';

/**
 * Component to handle automatic redirection after successful login
 * Place this in your AuthPage or login success handler
 */
export function LoginRedirectHandler() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role) {
      const defaultRoute = getDefaultRouteForRole(user.role);
      console.log(`Login successful for ${user.role}, redirecting to: ${defaultRoute}`);
      
      // Add a small delay to ensure state is properly set
      setTimeout(() => {
        navigate(defaultRoute, { replace: true });
      }, 100);
    }
  }, [user, navigate]);

  return null; // This component doesn't render anything
}

// Alternative: Hook version for use in your login function
export function useLoginRedirect() {
  const navigate = useNavigate();
  
  const redirectUserAfterLogin = (userRole: string) => {
    const defaultRoute = getDefaultRouteForRole(userRole);
    console.log(`Redirecting ${userRole} to: ${defaultRoute}`);
    navigate(defaultRoute, { replace: true });
  };
  
  return { redirectUserAfterLogin };
}

// Usage example in your login function:
/*
const handleLogin = async (credentials) => {
  try {
    const user = await loginUser(credentials);
    
    if (user) {
      // Use the redirect hook
      const { redirectUserAfterLogin } = useLoginRedirect();
      redirectUserAfterLogin(user.role);
      
      // OR manually redirect based on role
      const defaultRoute = getDefaultRouteForRole(user.role);
      navigate(defaultRoute, { replace: true });
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
*/