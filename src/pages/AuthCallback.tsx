// pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Handle the auth callback
                const { data, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (data.session) {
                    // Redirect to home or dashboard
                    navigate('/');
                } else {
                    // No session, redirect to login
                    navigate('/auth');
                }
            } catch (error) {
                console.error('Error handling auth callback:', error);
                navigate('/auth');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Verifying your account...</p>
            </div>
        </div>
    );
};

export default AuthCallback;