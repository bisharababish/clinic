// src/pages/AuthCallback.tsx - FIXED VERSION
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log("Processing auth callback...");

                // Check for token in the URL hash (Supabase format)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                console.log("Auth callback type:", type, "Has token:", !!accessToken);

                // Handle password reset flow
                if (type === 'recovery' && accessToken) {
                    console.log("Password reset flow detected, redirecting to reset page");

                    try {
                        // Set up the session with the token
                        await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || '',
                        });

                        // Use React Router navigation instead of window.location
                        navigate("/auth/reset-password", { replace: true });
                        return;
                    } catch (sessionError) {
                        console.error("Error setting session:", sessionError);
                        throw sessionError;
                    }
                }

                // Normal auth flow - check for session
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Session error:", error);
                    throw error;
                }

                if (data.session) {
                    console.log("Session found, processing user data...");

                    // Set authentication flags for the app
                    localStorage.setItem('auth_success', 'true');
                    sessionStorage.setItem('login_in_progress', 'true');

                    // Get user profile to check role
                    try {
                        const { data: userData } = await supabase
                            .from('userinfo')
                            .select('*')
                            .eq('user_email', data.session.user.email)
                            .single();

                        if (userData) {
                            // Cache user profile for the app
                            localStorage.setItem('clinic_user_profile', JSON.stringify({
                                ...userData,
                                role: userData.user_roles.toLowerCase()
                            }));

                            // Set role-specific flags
                            if (userData.user_roles === 'Admin' || userData.user_roles === 'admin') {
                                console.log("Admin user detected, redirecting to admin page.");
                                // Small delay to ensure state is properly set
                                setTimeout(() => {
                                    sessionStorage.removeItem('login_in_progress');
                                    navigate("/admin", { replace: true });
                                }, 100);
                                return;
                            }
                        }
                    } catch (userError) {
                        console.error("Error getting user data:", userError);
                        // Continue with default behavior
                    }

                    // Regular user or error getting user data - redirect to home
                    console.log("Regular user, redirecting to home");
                    setTimeout(() => {
                        sessionStorage.removeItem('login_in_progress');
                        navigate("/", { replace: true });
                    }, 100);
                } else {
                    console.log("No session found, redirecting to login...");
                    // Clear any auth flags and redirect to login
                    localStorage.removeItem('auth_success');
                    sessionStorage.removeItem('login_in_progress');
                    navigate("/auth", { replace: true });
                }
            } catch (error) {
                console.error('Error handling auth callback:', error);
                setError(error instanceof Error ? error.message : 'Authentication error');

                // Clear auth flags on error
                localStorage.removeItem('auth_success');
                sessionStorage.removeItem('login_in_progress');
                sessionStorage.removeItem('admin_login_success');

                // Redirect back to auth page after 3 seconds using React Router
                setTimeout(() => {
                    navigate("/auth", { replace: true });
                }, 3000);
            }
        };

        handleCallback();
    }, [navigate, location]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Authentication Error</h2>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <p className="text-gray-600">Redirecting to login page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-6 text-xl font-medium">Verifying your account...</p>
                <p className="mt-2 text-gray-600">You'll be redirected automatically in a moment.</p>
            </div>
        </div>
    );
};

export default AuthCallback;