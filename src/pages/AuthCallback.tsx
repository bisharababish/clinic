// src/pages/AuthCallback.tsx
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

                        // Redirect to reset password page with the token
                        window.location.href = "/auth/reset-password" + window.location.hash;
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
                    console.log("Session found, redirecting...");

                    // Set a flag to indicate successful authentication
                    localStorage.setItem('auth_success', 'true');

                    // Get user profile to check if admin
                    try {
                        const { data: userData } = await supabase
                            .from('userinfo')
                            .select('user_roles')
                            .eq('user_email', data.session.user.email)
                            .single();

                        if (userData && (userData.user_roles === 'Admin' || userData.user_roles === 'admin')) {
                            // Admin user - redirect to admin dashboard
                            console.log("Admin user detected, redirecting to admin dashboard");
                            window.location.href = "/admin";
                            return;
                        }
                    } catch (userError) {
                        console.error("Error getting user data:", userError);
                    }

                    // Regular user or error getting user data - redirect to clinics
                    window.location.href = "/clinics";
                } else {
                    console.log("No session found, redirecting to login...");
                    // Redirect to login
                    window.location.href = "/auth";
                }
            } catch (error) {
                console.error('Error handling auth callback:', error);
                setError(error instanceof Error ? error.message : 'Authentication error');

                // Even on error, redirect back to auth page after 3 seconds
                setTimeout(() => {
                    window.location.href = "/auth";
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