// src/pages/ResetPassword.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Footer from "@/components/layout/Footer";

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSession, setHasSession] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [buttonText, setButtonText] = useState('Reset Password');
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Check if we have a valid session for reset
    useEffect(() => {
        const checkSession = async () => {
            try {
                console.log("Checking for session in ResetPassword");

                // Check if we have a session
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                if (data.session) {
                    console.log("Valid session found for password reset");
                    setHasSession(true);
                } else {
                    // Try to get token from URL hash if present
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    const accessToken = hashParams.get('access_token');
                    const refreshToken = hashParams.get('refresh_token');
                    const type = hashParams.get('type');

                    console.log("URL hash check:", { type, hasToken: !!accessToken });

                    if (type === 'recovery' && accessToken) {
                        // Set up session with the token
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || '',
                        });

                        if (sessionError) {
                            throw sessionError;
                        }

                        console.log("Session set from URL hash");
                        setHasSession(true);
                    } else {
                        setError('No valid password reset session found. Please try the reset password process again.');
                    }
                }
            } catch (error) {
                console.error("Error checking session:", error);
                setError(error instanceof Error ? error.message : 'Failed to validate reset session');
            } finally {
                setInitializing(false);
            }
        };

        checkSession();
    }, [location]);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Set loading state and initial button text
        setLoading(true);
        setButtonText('Updating...');
        setError(null);

        try {
            // Update the user's password with the current session
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                throw updateError;
            }

            // Immediately show success state
            setLoading(false);
            setButtonText('Password Updated!');
            setIsSuccess(true);

            // Show success message
            toast({
                title: "Success",
                description: "Your password has been reset successfully. You can now log in with your new password.",
            });

            // Handle sign out and redirect after showing success
            setTimeout(async () => {
                try {
                    // Sign out to clear the recovery session
                    await supabase.auth.signOut();
                } catch (signOutError) {
                    console.error("Error during sign out:", signOutError);
                } finally {
                    // Redirect to login page
                    window.location.href = "/auth";
                }
            }, 1500);

        } catch (error) {
            console.error('Error resetting password:', error);
            setError(error instanceof Error ? error.message : 'Failed to reset password');
            setButtonText('Reset Password');
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="min-h-screen flex flex-col">
                <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Verifying your reset session...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-primary mb-2">
                            Bethlehem Med Center
                        </h1>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-gray-200">
                        {!hasSession ? (
                            <div className="space-y-4 text-center">
                                <h2 className="text-2xl font-bold text-red-600">Password Reset Error</h2>
                                <p className="text-gray-700">{error || "No valid reset session"}</p>
                                <div className="mt-4">
                                    <a
                                        href="/auth"
                                        className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                                    >
                                        Return to Login
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold">Create New Password</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Enter a new password for your account
                                    </p>
                                </div>

                                {isSuccess ? (
                                    <div className="p-4 bg-green-50 rounded-md text-center">
                                        <p className="text-green-800 font-medium">Password updated successfully!</p>
                                        <p className="text-gray-600 mt-2">Redirecting to login page...</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handlePasswordReset} className="space-y-4">
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium">
                                                    New Password
                                                </label>
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    required
                                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                                                    Confirm Password
                                                </label>
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    required
                                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="rounded-md bg-red-50 p-4">
                                                <div className="flex">
                                                    <div className="ml-3">
                                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <button
                                                type="submit"
                                                disabled={loading && buttonText !== 'Password Updated!'}
                                                className={`group relative flex w-full justify-center rounded-md border border-transparent ${buttonText === 'Password Updated!'
                                                    ? 'bg-green-600 hover:bg-green-700'
                                                    : 'bg-primary hover:bg-primary/90'
                                                    } px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70`}
                                            >
                                                {buttonText}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="text-center mt-4">
                                    <a href="/auth" className="text-sm text-primary hover:underline">
                                        Back to Login
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}