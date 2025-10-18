import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabaseClient as supabase } from '../lib/supabase';
import { SessionManager } from '../lib/sessionManager';

export type UserRole = 'admin' | 'doctor' | 'secretary' | 'patient' | 'x ray' | 'xray' | 'x-ray' | 'lab' | 'nurse';

interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    full_name?: string;
    // Arabic name fields
    arabic_name?: string | null;
    arabic_username_a?: string | null;
    arabic_username_b?: string | null;
    arabic_username_c?: string | null;
    arabic_username_d?: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    signup: (userData: SignupData) => Promise<void>;
    logout: () => Promise<void>;
}

// Updated to include individual name fields
interface SignupData {
    // Original fields - kept for backward compatibility
    email?: string;
    password?: string;
    englishName?: string;
    arabicName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;

    // New fields for separate name components
    english_username_a?: string;
    english_username_b?: string;
    english_username_c?: string;
    english_username_d?: string;
    arabic_username_a?: string;
    arabic_username_b?: string;
    arabic_username_c?: string;
    arabic_username_d?: string;

    // Database field names
    user_email?: string;
    user_password?: string;
    user_phonenumber?: string;
    date_of_birth?: string;
    gender_user?: string;
    user_roles?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // Function to safely update user state and cache
    const updateUserState = (userData: User | null) => {
        if (userData) {
            localStorage.setItem('clinic_user_profile', JSON.stringify(userData));
        } else {
            localStorage.removeItem('clinic_user_profile');
        }
        setUser(userData);
    };

    // Function to normalize role names for X-ray variations
    const normalizeRole = (role: string): UserRole => {
        const normalizedRole = role?.toLowerCase()?.trim();

        // Handle X-ray role variations
        if (normalizedRole === 'xray' || normalizedRole === 'x-ray' || normalizedRole === 'x ray') {
            return 'x ray';
        }

        // Handle other roles
        const validRoles: UserRole[] = ['admin', 'doctor', 'secretary', 'patient', 'x ray', 'lab', 'nurse'];
        return validRoles.includes(normalizedRole as UserRole) ? normalizedRole as UserRole : 'patient';
    };

    // Function to fetch user data from database
    const fetchUserData = useCallback(async (email: string) => {
        try {
            const { data: userData, error: userError } = await supabase
                .from('userinfo')
                .select('*')
                .ilike('user_email', email)
                .single();

            if (userError) {
                console.error("Error fetching user data:", userError);
                return null;
            }

            if (userData) {
                const normalizedRole = normalizeRole(userData.user_roles || 'patient');
                const fullName = userData.english_username_a || userData.user_email;

                // Construct Arabic full name from available parts
                const arabicNameParts = [
                    userData.arabic_username_a,
                    userData.arabic_username_b,
                    userData.arabic_username_c,
                    userData.arabic_username_d
                ].filter(part => part && part.trim());
                const arabicFullName = arabicNameParts.length > 0 ? arabicNameParts.join(' ') : null;

                return {
                    id: userData.userid.toString(),
                    email: userData.user_email,
                    name: fullName,
                    role: normalizedRole,
                    full_name: fullName,
                    // Arabic name fields
                    arabic_name: arabicFullName,
                    arabic_username_a: userData.arabic_username_a,
                    arabic_username_b: userData.arabic_username_b,
                    arabic_username_c: userData.arabic_username_c,
                    arabic_username_d: userData.arabic_username_d
                };
            }
            return null;
        } catch (error) {
            console.error("Error in fetchUserData:", error);
            return null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        const authTimeoutId: number | null = null;
        let forceTimeoutId: number | null = null;
        let isCurrentlyInitializing = false; // Track initialization state

        const forceLoadingComplete = () => {
            if (mounted && isCurrentlyInitializing) {
                console.log("[useAuth] FORCE: Loading complete due to timeout");
                setIsLoading(false);
                setIsInitialized(true);
                isCurrentlyInitializing = false;
            }
        };

        const resetAuthState = () => {
            if (mounted) {
                console.log("[useAuth] RESET: Forcing auth state reset");
                setIsLoading(false);
                setIsInitialized(true);
                isCurrentlyInitializing = false;

                // Clear any running timeouts
                if (forceTimeoutId) {
                    clearTimeout(forceTimeoutId);
                    forceTimeoutId = null;
                }
            }
        };

        const initializeAuth = async () => {
            if (isCurrentlyInitializing) return; // Prevent multiple concurrent initializations

            try {
                isCurrentlyInitializing = true;
                console.log("[useAuth] Starting SIMPLE auth initialization");

                // Simple timeout - force complete after 2 seconds
                forceTimeoutId = setTimeout(forceLoadingComplete, 2000) as unknown as number;

                // Simple session check without race conditions
                const { data, error } = await supabase.auth.getSession();

                if (!mounted) return;

                if (error) {
                    console.error("[useAuth] Session error:", error);
                    updateUserState(null);
                    setIsLoading(false);
                    setIsInitialized(true);
                    isCurrentlyInitializing = false;
                    return;
                }

                if (data?.session?.user) {
                    console.log("[useAuth] Session found, fetching user data");
                    const userData = await fetchUserData(data.session.user.email || '');
                    if (mounted) {
                        updateUserState(userData);
                    }
                } else {
                    console.log("[useAuth] No session found");
                    if (mounted) {
                        updateUserState(null);
                    }
                }

                // Clear the force timeout since we got a response
                if (forceTimeoutId) {
                    clearTimeout(forceTimeoutId);
                    forceTimeoutId = null;
                }

            } catch (error) {
                console.error("[useAuth] Initialization error:", error);
                if (mounted) {
                    updateUserState(null);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                    setIsInitialized(true);
                    isCurrentlyInitializing = false;
                    console.log("[useAuth] Auth initialization complete");
                }
            }
        };

        // DISABLED: Handle tab visibility changes - was causing flashing
        // const handleVisibilityChange = () => {
        //     if (!document.hidden && mounted) {
        //         console.log("[useAuth] Tab became visible - IMMEDIATE RESET");
        //         resetAuthState();
        //     }
        // };

        // DISABLED: Handle window focus - was causing flashing
        // const handleFocus = () => {
        //     if (mounted) {
        //         console.log("[useAuth] Window focused - IMMEDIATE RESET");
        //         resetAuthState();
        //     }
        // };

        // DISABLED: Add event listeners BEFORE initialization - was causing flashing
        // document.addEventListener('visibilitychange', handleVisibilityChange);
        // window.addEventListener('focus', handleFocus);

        // Start initialization
        initializeAuth();

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;
                console.log("[useAuth] Auth state change:", event);

                // Don't interfere with login process
                if (event === 'SIGNED_IN') {
                    // Small delay to let login complete
                    setTimeout(() => {
                        if (mounted && session?.user) {
                            fetchUserData(session.user.email || '').then(userData => {
                                if (mounted && userData) {
                                    updateUserState(userData);
                                }
                            });
                        }
                    }, 100);
                    return;
                }

                try {
                    if (session?.user) {
                        const userData = await fetchUserData(session.user.email || '');
                        if (mounted) {
                            updateUserState(userData);
                        }
                    } else {
                        if (mounted) {
                            updateUserState(null);
                        }
                    }
                } catch (error) {
                    console.error("[useAuth] Auth state change error:", error);
                    if (mounted) {
                        updateUserState(null);
                    }
                }
            }
        );

        return () => {
            mounted = false;
            isCurrentlyInitializing = false;
            if (authTimeoutId) clearTimeout(authTimeoutId);
            if (forceTimeoutId) clearTimeout(forceTimeoutId);
            // DISABLED: Remove event listeners - was causing flashing
            // document.removeEventListener('visibilitychange', handleVisibilityChange);
            // window.removeEventListener('focus', handleFocus);
            subscription.unsubscribe();
        };
    }, [fetchUserData]);

    // Your existing login, signup, logout functions stay EXACTLY the same
    const login = async (email: string, password: string): Promise<User> => {
        setIsLoading(true);

        try {
            console.log('Login attempt starting:', email);

            // 1. Try to login with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            console.log('Auth attempt result:', authError ? 'Error' : 'Success');

            if (authError) {
                console.error('Auth login error:', authError);
                throw new Error('Invalid email or password');
            }

            if (!authData.user) {
                throw new Error('Authentication failed');
            }

            // 2. Check if user exists in database (case insensitive)
            console.log('Looking for user profile in database');
            const userData = await fetchUserData(email);

            console.log('Database lookup result:', userData ? 'Found' : 'Not found');

            // Handle admin special case
            // Handle admin special case
            if (userData && userData.role === 'admin') {
                console.log('Admin user detected');

                // Set special flag for admin session
                sessionStorage.setItem('admin_login_success', 'true');

                // Cache user profile for faster access
                localStorage.setItem('clinic_user_profile', JSON.stringify(userData));
                setUser(userData);

                await new Promise(resolve => setTimeout(resolve, 500));

                return userData;
            }

            // 3. If user doesn't exist in database, create profile automatically
            if (!userData) {
                console.log('User profile not found, creating one...');

                const currentTimestamp = new Date().toISOString();

                // Create new profile with default patient role
                const { data: insertData, error: createError } = await supabase
                    .from('userinfo')
                    .insert({
                        user_roles: 'patient',
                        arabic_username_a: email,
                        arabic_username_b: email,
                        arabic_username_c: email,
                        arabic_username_d: email,
                        english_username_a: email,
                        english_username_b: email,
                        english_username_c: email,
                        english_username_d: email,
                        user_email: email,
                        user_phonenumber: '0000000000',
                        date_of_birth: currentTimestamp,
                        gender_user: 'unknown',
                        user_password: password,
                        created_at: currentTimestamp,
                        updated_at: currentTimestamp,
                        pdated_at: currentTimestamp
                    })
                    .select();

                if (createError) {
                    console.error('Error creating user profile:', createError);
                    throw new Error('Failed to create user profile');
                }

                if (!insertData || insertData.length === 0) {
                    throw new Error('Failed to retrieve created user data');
                }

                console.log('New profile created successfully');
                const normalizedRole = normalizeRole(insertData[0].user_roles);
                const fullName = insertData[0].english_username_a;

                // Construct Arabic full name from available parts
                const arabicNameParts = [
                    insertData[0].arabic_username_a,
                    insertData[0].arabic_username_b,
                    insertData[0].arabic_username_c,
                    insertData[0].arabic_username_d
                ].filter(part => part && part.trim());
                const arabicFullName = arabicNameParts.length > 0 ? arabicNameParts.join(' ') : null;

                const userObj: User = {
                    id: insertData[0].userid.toString(),
                    email: insertData[0].user_email,
                    name: fullName,
                    role: normalizedRole,
                    full_name: fullName,
                    arabic_name: arabicFullName,
                    arabic_username_a: insertData[0].arabic_username_a,
                    arabic_username_b: insertData[0].arabic_username_b,
                    arabic_username_c: insertData[0].arabic_username_c,
                    arabic_username_d: insertData[0].arabic_username_d
                };

                // Cache user profile for faster access
                localStorage.setItem('clinic_user_profile', JSON.stringify(userObj));
                setUser(userObj);

                return userObj;
            }

            // 4. User exists, return data
            console.log('Existing profile found, login successful');
            // Cache user profile
            localStorage.setItem('clinic_user_profile', JSON.stringify(userData));
            setUser(userData);

            // Add small delay to let auth state propagate
            await new Promise(resolve => setTimeout(resolve, 100));

            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Modified to handle both the old and new field formats
    const signup = async (userData: SignupData) => {
        setIsLoading(true);

        try {
            console.log("Starting signup process");

            // Normalize data - extract email from different possible sources
            const email = userData.user_email || userData.email;
            const password = userData.user_password || userData.password;

            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // 1. Check email availability (case insensitive)
            const existingEmail = await fetchUserData(email);
            if (existingEmail) {
                throw new Error('This email is already registered. Please login.');
            }

            // 2. Create auth user
            console.log("Creating auth user");
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (authError) {
                console.error('Auth signup error:', authError);

                // Handle rate limiting error gracefully
                if (authError.message && authError.message.includes('security purposes') && authError.message.includes('seconds')) {
                    throw new Error('Please try again in a moment');
                }

                throw authError;
            }

            if (!authData.user) {
                throw new Error('Failed to create auth user');
            }

            console.log("Auth user created successfully");

            // 3. Create user profile
            console.log("Creating user profile in database");
            const currentTimestamp = new Date().toISOString();

            // Normalize the role
            const normalizedRole = normalizeRole(userData.user_roles || 'patient');

            // Debug: Check auth user ID
            console.log('🔍 Auth user created:', authData.user);
            console.log('🔍 Auth user ID:', authData.user.id);

            // Prepare insert data - handle both formats of input data
            const insertData = {
                // Link to auth user
                id: authData.user.id, // This is the UUID from auth.users

                user_roles: normalizedRole,

                // Handle separate name fields (preferred)
                english_username_a: userData.english_username_a || userData.englishName || email,
                english_username_b: userData.english_username_b || userData.englishName || email,
                english_username_c: userData.english_username_c || userData.englishName || email,
                english_username_d: userData.english_username_d || userData.englishName || email,

                arabic_username_a: userData.arabic_username_a || userData.arabicName || email,
                arabic_username_b: userData.arabic_username_b || userData.arabicName || email,
                arabic_username_c: userData.arabic_username_c || userData.arabicName || email,
                arabic_username_d: userData.arabic_username_d || userData.arabicName || email,

                // Other fields
                user_email: email,
                user_phonenumber: userData.user_phonenumber || userData.phoneNumber || '0000000000',
                date_of_birth: userData.date_of_birth || userData.dateOfBirth || currentTimestamp,
                gender_user: userData.gender_user || userData.gender || 'unknown',
                user_password: password,

                // Timestamps
                created_at: currentTimestamp,
                updated_at: currentTimestamp,
                pdated_at: currentTimestamp
            };

            const { data: userInsertData, error: profileError } = await supabase
                .from('userinfo')
                .insert(insertData)
                .select();

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Try to rollback auth user if profile creation fails
                await supabase.auth.signOut();
                throw new Error(`Failed to create profile: ${profileError.message}`);
            }

            if (userInsertData && userInsertData.length > 0) {
                const normalizedRole = normalizeRole(userInsertData[0].user_roles);
                const fullName = userInsertData[0].english_username_a;

                // Construct Arabic full name from available parts
                const arabicNameParts = [
                    userInsertData[0].arabic_username_a,
                    userInsertData[0].arabic_username_b,
                    userInsertData[0].arabic_username_c,
                    userInsertData[0].arabic_username_d
                ].filter(part => part && part.trim());
                const arabicFullName = arabicNameParts.length > 0 ? arabicNameParts.join(' ') : null;

                const userObj: User = {
                    id: userInsertData[0].userid.toString(),
                    email: userInsertData[0].user_email,
                    name: fullName,
                    role: normalizedRole,
                    full_name: fullName,
                    arabic_name: arabicFullName,
                    arabic_username_a: userInsertData[0].arabic_username_a,
                    arabic_username_b: userInsertData[0].arabic_username_b,
                    arabic_username_c: userInsertData[0].arabic_username_c,
                    arabic_username_d: userInsertData[0].arabic_username_d
                };

                // Cache user profile
                localStorage.setItem('clinic_user_profile', JSON.stringify(userObj));
            }

            console.log('User profile created successfully during signup');

        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem('clinic_user_profile');
            sessionStorage.removeItem('login_in_progress');
            sessionStorage.removeItem('admin_login_success');
            // Clear session tracking
            SessionManager.getInstance().clearSession();
            setUser(null);
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error logging out:', error);
            setUser(null);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
