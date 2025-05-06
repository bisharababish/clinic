// pages/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log("Processing auth callback...");

                // Handle the auth callback
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Session error:", error);
                    throw error;
                }

                if (data.session) {
                    console.log("Session found, redirecting...");

                    // Set a flag to indicate successful authentication
                    localStorage.setItem('auth_success', 'true');

                    // Use direct location change instead of React Router for maximum compatibility
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
    }, [navigate]);

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