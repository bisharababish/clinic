// src/hooks/useAuth.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'doctor' | 'secretary' | 'patient';

interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Function to safely update user state and cache
    const updateUserState = (userData: User | null) => {
        if (userData) {
            localStorage.setItem('clinic_user_profile', JSON.stringify(userData));
        } else {
            localStorage.removeItem('clinic_user_profile');
        }
        setUser(userData);
    };

    // Function to fetch user data from database
    const fetchUserData = async (email: string) => {
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
                return {
                    id: userData.userid.toString(),
                    email: userData.user_email,
                    name: userData.english_username_a,
                    role: (userData.user_roles || 'patient').toLowerCase() as UserRole
                };
            }
            return null;
        } catch (error) {
            console.error("Error in fetchUserData:", error);
            return null;
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // Check for active session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Session error:", error);
                    if (mounted) {
                        updateUserState(null);
                        setIsLoading(false);
                    }
                    return;
                }

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
                console.error("Initialization error:", error);
                if (mounted) {
                    updateUserState(null);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initializeAuth();

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

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
                    console.error("Auth state change error:", error);
                    if (mounted) {
                        updateUserState(null);
                    }
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

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
            if (userData && userData.role === 'admin') {
                console.log('Admin user detected');

                // Cache user profile for faster access
                localStorage.setItem('clinic_user_profile', JSON.stringify(userData));
                setUser(userData);

                return userData;
            }
            // 3. If user doesn't exist in database, create profile automatically
            if (!userData) {
                console.log('User profile not found, creating one...');

                const currentTimestamp = new Date().toISOString();

                // Create new profile
                const { data: insertData, error: createError } = await supabase
                    .from('userinfo')
                    .insert({
                        user_roles: 'Patient',
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
                const userObj: User = {
                    id: insertData[0].userid.toString(),
                    email: insertData[0].user_email,
                    name: insertData[0].english_username_a,
                    role: insertData[0].user_roles.toLowerCase() as UserRole
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

            return userData;

        } catch (error) {
            setIsLoading(false);
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
                    emailRedirectTo: process.env.NODE_ENV === 'production'
                        ? 'https://bethlehemmedcenter.com/auth/callback'
                        : `${window.location.origin}/auth/callback`
                }
            });

            if (authError) {
                console.error('Auth signup error:', authError);
                throw authError;
            }

            if (!authData.user) {
                throw new Error('Failed to create auth user');
            }

            console.log("Auth user created successfully");

            // 3. Create user profile
            console.log("Creating user profile in database");
            const currentTimestamp = new Date().toISOString();

            // Prepare insert data - handle both formats of input data
            const insertData = {
                user_roles: userData.user_roles || 'Patient',

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
                const userObj: User = {
                    id: userInsertData[0].userid.toString(),
                    email: userInsertData[0].user_email,
                    name: userInsertData[0].english_username_a,
                    role: userInsertData[0].user_roles.toLowerCase() as UserRole
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
            await supabase.auth.signOut();
            // Clear user data
            localStorage.removeItem('clinic_user_profile');
            sessionStorage.removeItem('login_in_progress');
            localStorage.removeItem('admin_authenticated'); // Add this line for cleanup

            setUser(null);
        } catch (error) {
            console.error('Error logging out:', error);
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