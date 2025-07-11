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
                console.log("Current URL:", window.location.href);

                // Check URL for recovery type and tokens
                const urlParams = new URLSearchParams(window.location.search);
                const hashParams = new URLSearchParams(window.location.hash.substring(1));

                const type = urlParams.get('type') || hashParams.get('type');
                const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
                const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');

                console.log("Auth callback:", { type, hasAccessToken: !!accessToken });

                // Handle password recovery FIRST
                if (type === 'recovery') {
                    console.log("Password recovery detected, setting session");

                    try {
                        // Set the session with the tokens from URL
                        const { data, error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || '',
                        });

                        if (error) {
                            console.error("Error setting recovery session:", error);
                            throw error;
                        }

                        if (data.session) {
                            console.log("Recovery session set successfully, redirecting");
                            navigate("/auth/reset-password", { replace: true });
                            return;
                        } else {
                            throw new Error("Failed to create session from recovery tokens");
                        }
                    } catch (sessionError) {
                        console.error("Session setup failed:", sessionError);
                        setError("Invalid recovery link. Please try again.");
                        setTimeout(() => {
                            navigate("/auth", { replace: true });
                        }, 3000);
                        return;
                    }
                }

                // Handle normal auth flow
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Session error:", error);
                    throw error;
                }

                if (data.session) {
                    console.log("Session found, processing user data...");

                    localStorage.setItem('auth_success', 'true');
                    sessionStorage.setItem('login_in_progress', 'true');

                    try {
                        const { data: userData } = await supabase
                            .from('userinfo')
                            .select('*')
                            .eq('user_email', data.session.user.email)
                            .single();

                        if (userData) {
                            localStorage.setItem('clinic_user_profile', JSON.stringify({
                                ...userData,
                                role: userData.user_roles.toLowerCase()
                            }));

                            if (userData.user_roles === 'Admin' || userData.user_roles === 'admin') {
                                setTimeout(() => {
                                    sessionStorage.removeItem('login_in_progress');
                                    navigate("/admin", { replace: true });
                                }, 100);
                                return;
                            }
                        }
                    } catch (userError) {
                        console.error("Error getting user data:", userError);
                    }

                    setTimeout(() => {
                        sessionStorage.removeItem('login_in_progress');
                        navigate("/", { replace: true });
                    }, 100);
                } else {
                    console.log("No session found, redirecting to login...");
                    navigate("/auth", { replace: true });
                }
            } catch (error) {
                console.error('Error handling auth callback:', error);
                setError(error instanceof Error ? error.message : 'Authentication error');
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