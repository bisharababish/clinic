// src/pages/ResetPassword.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSession, setHasSession] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [buttonText, setButtonText] = useState('Reset Password');
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Check if we have a valid session for reset
    useEffect(() => {
        // Replace the entire checkSession function with this:
        const checkSession = async () => {
            try {
                console.log("Checking for session in ResetPassword");

                // First check URL hash for recovery tokens
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                if (type === 'recovery' && accessToken) {
                    console.log("Setting session from URL hash");
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || '',
                    });

                    if (sessionError) {
                        throw sessionError;
                    }
                    setHasSession(true);
                    return;
                }

                // Then check existing session
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (data.session) {
                    console.log("Valid session found for password reset");
                    setHasSession(true);
                } else {
                    setError('No valid password reset session found. Please try the reset password process again.');
                }
            } catch (error) {
                console.error("Error checking session:", error);
                setError('Invalid or expired reset link. Please request a new password reset.');
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

        setLoading(true);
        setButtonText('Updating...');
        setButtonText('Password Changed!');
        setError(null);

        try {
            // Update the user's password
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                throw updateError;
            }

            // Immediately update the button text and style
            setButtonText('Password Changed!');
            if (buttonRef.current) {
                buttonRef.current.style.backgroundColor = '#16a34a'; // green-600
                buttonRef.current.disabled = true;
            }

            // Show success message
            toast({
                title: "Success",
                description: "Your password has been reset successfully. You can now log in with your new password.",
            });

            // Sign out and redirect after delay
            setTimeout(async () => {
                try {
                    await supabase.auth.signOut();
                } catch (signOutError) {
                    console.error("Error during sign out:", signOutError);
                } finally {
                    window.location.href = "/auth";
                }
            }, 1500);

        } catch (error) {
            console.error('Error resetting password:', error);
            setError(error instanceof Error ? error.message : 'Failed to reset password');
            setButtonText('Reset Password');
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="min-h-screen flex flex-col">
                <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="text-center">
                        <Skeleton width={48} height={48} circle className="mx-auto mb-4" />
                        <Skeleton width={180} height={20} className="mx-auto mb-2" />
                        <Skeleton width={120} height={16} className="mx-auto" />
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
                                            ref={buttonRef}
                                            type="submit"
                                            disabled={loading || buttonText === 'Password Changed!'}
                                            className={`group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 ${buttonText === 'Password Changed!'
                                                ? 'bg-green-600 hover:bg-green-600'
                                                : 'bg-primary hover:bg-primary/90'
                                                } ${loading ? 'opacity-70' : ''}`}
                                        >
                                            {buttonText}
                                        </button>
                                    </div>
                                </form>

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