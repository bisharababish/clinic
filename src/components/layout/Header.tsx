// components/layout/Header.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export function Header() {
    const { user, logout } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [effectiveRole, setEffectiveRole] = useState<string | null>(null);

    // Extra check for authentication state on mount and when user changes
    useEffect(() => {
        const checkAuthStatus = async () => {
            // Check if we have user in the context
            if (user) {
                console.log("User found in context:", user);
                setIsAuthenticated(true);
                setEffectiveRole(user.role);
                return;
            }

            // Check admin login success flag
            const adminLoginSuccess = sessionStorage.getItem('admin_login_success');
            if (adminLoginSuccess === 'true') {
                console.log('Admin login flag detected');
                setIsAuthenticated(true);
                setEffectiveRole('admin');
                return;
            }

            // Fallback check for session directly from Supabase
            try {
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    console.log("Session found but no user in context");
                    setIsAuthenticated(true);

                    // Try to get user profile from database
                    const { data: userData, error: userError } = await supabase
                        .from('userinfo')
                        .select('user_roles')
                        .ilike('user_email', data.session.user.email || '')
                        .single();

                    if (!userError && userData) {
                        // Convert to lowercase for consistency
                        setEffectiveRole(userData.user_roles.toLowerCase());
                    }
                    return;
                }

                // Also check localStorage as a last resort
                const cachedUser = localStorage.getItem('clinic_user_profile');
                if (cachedUser) {
                    console.log("Cached user found in localStorage");
                    setIsAuthenticated(true);
                    const userObj = JSON.parse(cachedUser);
                    setEffectiveRole(userObj.role);
                    return;
                }

                console.log("No authentication found");
                setIsAuthenticated(false);
                setEffectiveRole(null);
            } catch (error) {
                console.error("Error checking auth status:", error);
                setIsAuthenticated(false);
                setEffectiveRole(null);
            }
        };

        checkAuthStatus();
    }, [user]);

    // Define which navigation items are visible based on role
    const isAdmin = effectiveRole === "admin";
    const isDoctor = effectiveRole === "doctor";
    const isSecretary = effectiveRole === "secretary";
    const isNurse = effectiveRole === "nurse";
    const isLab = effectiveRole === "lab";
    const isXRay = effectiveRole === "x ray";
    const isPatient = effectiveRole === "patient";

    // Define permissions based on roles
    const canViewHome = isAuthenticated;
    const canViewClinics = isAuthenticated;
    const canViewLabs = isAuthenticated && (isAdmin || isDoctor || isLab);
    const canViewXray = isAuthenticated && (isAdmin || isDoctor || isXRay);
    const canViewAboutUs = isAuthenticated && (isAdmin || isPatient);
    const canViewAdmin = isAuthenticated && isAdmin;

    // Handle logout click
    const handleLogout = async () => {
        try {
            // First clear any local storage and session storage items
            localStorage.removeItem('clinic_user_profile');
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.removeItem('login_in_progress');
            sessionStorage.removeItem('admin_login_success');

            // Then try to logout through the hook
            if (logout) {
                await logout();
            } else {
                // Fallback to direct Supabase logout
                await supabase.auth.signOut();
            }

            // Force state update immediately
            setIsAuthenticated(false);
            setEffectiveRole(null);

            // Redirect to login page after logout
            window.location.href = "/auth";
        } catch (error) {
            console.error('Logout error:', error);
            // Force a hard redirect in case of error
            window.location.href = "/auth";
        }
    };

    return (
        <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2">
                    {/* Logo */}
                    <div className="w-10 h-10 bg-blue-500 rounded-full" />
                    <span className="text-xl font-bold">Bethlehem Med Center</span>
                </Link>
            </div>

            <nav className="hidden md:flex gap-2">
                {canViewHome && (
                    <Button variant="ghost" asChild>
                        <Link to="/">Home</Link>
                    </Button>
                )}

                {canViewClinics && (
                    <Button variant="ghost" asChild>
                        <Link to="/clinics">Clinics</Link>
                    </Button>
                )}

                {canViewAboutUs && (
                    <Button variant="ghost" asChild>
                        <Link to="/about">About Us</Link>
                    </Button>
                )}

                {/* Only show Labs to authorized roles */}
                {canViewLabs && (
                    <Button variant="ghost" asChild>
                        <Link to="/labs">Labs</Link>
                    </Button>
                )}

                {/* Only show X-Ray to authorized roles */}
                {canViewXray && (
                    <Button variant="ghost" asChild>
                        <Link to="/xray">X-Ray</Link>
                    </Button>
                )}

                {/* Only show Admin Dashboard to admin users */}
                {canViewAdmin && (
                    <Button variant="ghost" asChild>
                        <Link to="/admin">Admin Dashboard</Link>
                    </Button>
                )}

                {/* Conditional button for Login/Logout */}
                {isAuthenticated ? (
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                ) : (
                    <Button variant="ghost" asChild>
                        <Link to="/auth">Login</Link>
                    </Button>
                )}
            </nav>

            {/* Show role indicator */}
            {effectiveRole && (
                <div className="hidden md:block">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize border ${effectiveRole === "admin"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : effectiveRole === "doctor"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : effectiveRole === "secretary"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : effectiveRole === "nurse"
                                    ? "bg-teal-100 text-teal-800 border-teal-200"
                                    : effectiveRole === "lab"
                                        ? "bg-amber-100 text-amber-800 border-amber-200"
                                        : effectiveRole === "x ray"
                                            ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                                            : effectiveRole === "patient"
                                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                : "bg-green-100 text-green-800 border-green-200"
                        }`}>
                        {effectiveRole}
                    </span>
                </div>
            )}
        </header>
    );
}