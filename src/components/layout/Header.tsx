// components/layout/Header.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export function Header() {
    const { user, logout } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Extra check for authentication state on mount and when user changes
    useEffect(() => {
        const checkAuthStatus = async () => {
            // Check if we have user in the context
            if (user) {
                console.log("User found in context:", user);
                setIsAuthenticated(true);
                return;
            }

            // Fallback check for session directly from Supabase
            try {
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    console.log("Session found but no user in context");
                    setIsAuthenticated(true);
                    return;
                }

                // Also check localStorage as a last resort
                const cachedUser = localStorage.getItem('clinic_user_profile');
                if (cachedUser) {
                    console.log("Cached user found in localStorage");
                    setIsAuthenticated(true);
                    return;
                }

                console.log("No authentication found");
                setIsAuthenticated(false);
            } catch (error) {
                console.error("Error checking auth status:", error);
                setIsAuthenticated(false);
            }
        };

        checkAuthStatus();
    }, [user]);

    // Define which navigation items are visible based on role
    const isAdmin = user?.role === "admin";
    const canViewLabs = isAuthenticated && (user?.role === "admin" || user?.role === "doctor" || user?.role === "secretary");
    const canViewXray = isAuthenticated && (user?.role === "admin" || user?.role === "doctor" || user?.role === "secretary");

    // Handle logout click
    const handleLogout = async () => {
        try {
            await logout();
            // Force state update immediately
            setIsAuthenticated(false);
            // Clear any cached auth data
            localStorage.removeItem('clinic_user_profile');
            localStorage.removeItem('supabase.auth.token');
            // Redirect to login page after logout
            window.location.href = "/auth";
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2">
                    {/* Logo */}
                    <div className="w-10 h-10 bg-blue-500 rounded-full" />
                    <span className="text-xl font-bold">Bethlehem Clinic Center</span>
                </Link>
            </div>

            <nav className="hidden md:flex gap-2">
                <Button variant="ghost" asChild>
                    <Link to="/">Home</Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link to="/clinics">Clinics</Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link to="/about">About Us</Link>
                </Button>

                {/* Only show Labs and X-Ray to authorized roles */}
                {canViewLabs && (
                    <Button variant="ghost" asChild>
                        <Link to="/labs">Labs</Link>
                    </Button>
                )}

                {canViewXray && (
                    <Button variant="ghost" asChild>
                        <Link to="/xray">X-Ray</Link>
                    </Button>
                )}

                {/* Only show Admin Dashboard to admin users */}
                {isAdmin && (
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

            {/* Show role indicator only for non-patients */}
            {user && user.role !== "patient" && (
                <div className="hidden md:block">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize border ${user.role === "admin"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : user.role === "doctor"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-purple-100 text-purple-800 border-purple-200"
                        }`}>
                        {user.role}
                    </span>
                </div>
            )}
        </header>
    );
}