// src/pages/AuthCallback.tsx - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState<string | null>(null);
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log("Processing auth callback...");
                console.log("Current URL:", window.location.href);

                const urlParams = new URLSearchParams(window.location.search);
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const type = urlParams.get('type') || hashParams.get('type');

                if (type === 'recovery') {
                    console.log("Password recovery detected, redirecting with params");
                    // Skip callback entirely - go directly to reset password page
                    navigate('/auth/reset-password', { replace: true });
                    return;
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
                                }, 200);
                                return;
                            }
                        }
                    } catch (userError) {
                        console.error("Error getting user data:", userError);
                    }

                    setTimeout(() => {
                        sessionStorage.removeItem('login_in_progress');
                        navigate("/home", { replace: true });
                    }, 200);
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
            <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className={`bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full ${isRTL ? 'text-right' : 'text-center'}`}>
                    <h2 className={`text-xl font-semibold text-red-800 mb-2 ${isRTL ? 'text-right' : 'text-center'}`}>
                        {t('authCallback.error') || 'Authentication Error'}
                    </h2>
                    <p className={`text-gray-700 mb-4 ${isRTL ? 'text-right' : 'text-center'}`}>{error}</p>
                    <p className={`text-gray-600 ${isRTL ? 'text-right' : 'text-center'}`}>
                        {t('authCallback.redirecting') || 'Redirecting to login page...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`text-center ${isRTL ? 'text-right' : 'text-center'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className={`mt-6 text-xl font-medium ${isRTL ? 'text-right' : 'text-center'}`}>
                    {t('authCallback.verifying') || 'Verifying your account...'}
                </p>
                <p className={`mt-2 text-gray-600 ${isRTL ? 'text-right' : 'text-center'}`}>
                    {t('authCallback.redirectingAuto') || 'You\'ll be redirected automatically in a moment.'}
                </p>
            </div>
        </div>
    );
};

export default AuthCallback;
