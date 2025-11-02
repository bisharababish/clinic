// components/guards/RoleBasedRouteGuard.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getRolePermissions, getDefaultRouteForRole } from '../../lib/rolePermissions';

interface RoleBasedRouteGuardProps {
    children: React.ReactNode;
}

export function RoleBasedRouteGuard({ children }: RoleBasedRouteGuardProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user || !user.role) return;

        const userRole = user.role.toLowerCase();
        const currentPath = location.pathname;
        const permissions = getRolePermissions(userRole);

        // Define which paths each role can access
        const roleAccessMap: Record<string, boolean> = {
            '/': permissions.canViewHome,
            '/home': permissions.canViewHome,
            '/clinics': permissions.canViewClinics,
            '/labs': permissions.canViewLabs,
            '/xray': permissions.canViewXray,
            '/ultrasound': permissions.canViewUltrasound,
            '/admin': permissions.canViewAdmin,
        };

        // Check if current path is accessible for the user's role
        const hasAccess = roleAccessMap[currentPath];

        // If user doesn't have access to current route, redirect to their default route
        if (hasAccess === false) {
            const defaultRoute = getDefaultRouteForRole(userRole);
            console.log(`Redirecting ${userRole} from ${currentPath} to ${defaultRoute}`);
            navigate(defaultRoute, { replace: true });
        }

        // Special handling for lab, x-ray, and ultrasound users accessing home page
        if ((userRole === 'lab' || userRole === 'xray' || userRole === 'x ray' || userRole === 'ultrasound') &&
            (currentPath === '/' || currentPath === '/home')) {
            const defaultRoute = getDefaultRouteForRole(userRole);
            console.log(`Redirecting ${userRole} from home to ${defaultRoute}`);
            navigate(defaultRoute, { replace: true });
        }
    }, [user, location.pathname, navigate]);

    return <>{children}</>;
}

// Hook to check if user can access a specific route
export function useCanAccessRoute(path: string): boolean {
    const { user } = useAuth();

    if (!user || !user.role) return false;

    const permissions = getRolePermissions(user.role);

    const roleAccessMap: Record<string, boolean> = {
        '/': permissions.canViewHome,
        '/home': permissions.canViewHome,
        '/clinics': permissions.canViewClinics,
        '/labs': permissions.canViewLabs,
        '/xray': permissions.canViewXray,
        '/ultrasound': permissions.canViewUltrasound,
        '/admin': permissions.canViewAdmin,
    };

    return roleAccessMap[path] ?? false;
}
