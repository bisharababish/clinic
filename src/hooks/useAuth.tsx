// Modified useAuth.tsx - Improved login and session handling
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

interface SignupData {
    email: string;
    password: string;
    englishName: string;
    arabicName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Improved session checking with better error handling
    useEffect(() => {
        // Check for active session on mount
        const checkSession = async () => {
            try {
                console.log("Checking session on mount...");
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    console.log("Session found:", session.user.email);
                    // Use case-insensitive query
                    const { data: userData, error: userError } = await supabase
                        .from('userinfo')
                        .select('*')
                        .ilike('user_email', session.user.email || '')
                        .single();

                    if (userError) {
                        console.error("Error fetching user data:", userError);
                        // Don't throw here, just log the error
                    }

                    if (userData) {
                        console.log("User data found in database:", userData.english_username_a);
                        setUser({
                            id: userData.userid.toString(),
                            email: userData.user_email,
                            name: userData.english_username_a,
                            role: (userData.user_roles || 'patient').toLowerCase() as UserRole
                        });
                    } else {
                        console.log("No user data found for email:", session.user.email);
                    }
                } else {
                    console.log("No active session found");
                }
            } catch (error) {
                console.error("Session check error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();

        // Set up auth state change listener with improved error handling
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("Auth state changed:", event, session?.user?.email);

                if (session?.user) {
                    try {
                        // Use case-insensitive query
                        const { data: userData, error: userError } = await supabase
                            .from('userinfo')
                            .select('*')
                            .ilike('user_email', session.user.email || '')
                            .single();

                        if (userError) {
                            console.error("Error fetching user data on auth change:", userError);
                        }

                        if (userData) {
                            console.log("User data found on auth change:", userData.english_username_a);
                            setUser({
                                id: userData.userid.toString(),
                                email: userData.user_email,
                                name: userData.english_username_a,
                                role: (userData.user_roles || 'patient').toLowerCase() as UserRole
                            });
                        } else {
                            console.log("No user data found for email on auth change:", session.user.email);
                            // Create basic profile data if it doesn't exist
                            const timestamp = new Date().toISOString();
                            const { error: insertError } = await supabase.from('userinfo').insert({
                                user_roles: 'Patient',
                                english_username_a: session.user.email,
                                english_username_b: session.user.email,
                                english_username_c: session.user.email,
                                english_username_d: session.user.email,
                                arabic_username_a: session.user.email,
                                arabic_username_b: session.user.email,
                                arabic_username_c: session.user.email,
                                arabic_username_d: session.user.email,
                                user_email: session.user.email,
                                created_at: timestamp,
                                updated_at: timestamp
                            });

                            if (insertError) {
                                console.error("Error creating user profile on auth change:", insertError);
                            } else {
                                // Set basic user object
                                setUser({
                                    id: '0', // Will be updated on next auth change
                                    email: session.user.email || '',
                                    name: session.user.email || '',
                                    role: 'patient'
                                });
                            }
                        }
                    } catch (error) {
                        console.error("Error handling auth state change:", error);
                    }
                } else {
                    setUser(null);
                }
                setIsLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // The login function with improved error handling and navigation
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
            const { data: userData, error: dbError } = await supabase
                .from('userinfo')
                .select('*')
                .ilike('user_email', email)
                .single();

            console.log('Database lookup result:', userData ? 'Found' : 'Not found');

            // 3. If user doesn't exist in database, create profile automatically
            if (!userData || dbError) {
                console.log('User profile not found, creating one...');

                const currentTimestamp = new Date().toISOString();

                // Create new profile
                const { error: createError } = await supabase
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
                    });

                if (createError) {
                    console.error('Error creating user profile:', createError);
                    throw new Error('Failed to create user profile');
                }

                // Fetch the new user data
                console.log('Fetching newly created profile');
                const { data: newUserData, error: fetchError } = await supabase
                    .from('userinfo')
                    .select('*')
                    .ilike('user_email', email)
                    .single();

                if (fetchError || !newUserData) {
                    console.error('Error fetching new user:', fetchError);
                    throw new Error('Failed to retrieve user profile');
                }

                console.log('New profile created successfully');
                const userObj: User = {
                    id: newUserData.userid.toString(),
                    email: newUserData.user_email,
                    name: newUserData.english_username_a,
                    role: newUserData.user_roles.toLowerCase() as UserRole
                };

                setUser(userObj);

                // Force session update in localStorage
                localStorage.setItem('supabase.auth.token', JSON.stringify({
                    currentSession: authData.session,
                    expiresAt: (Date.now() + 3600 * 1000)
                }));

                return userObj;
            }

            // 4. User exists, return data
            console.log('Existing profile found, login successful');
            const userObj: User = {
                id: userData.userid.toString(),
                email: userData.user_email,
                name: userData.english_username_a,
                role: userData.user_roles.toLowerCase() as UserRole
            };

            setUser(userObj);
            return userObj;

        } catch (error) {
            setIsLoading(false);
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // The rest of the functions (signup, logout) remain the same
    const signup = async (userData: SignupData) => {
        setIsLoading(true);

        try {
            console.log("Starting signup process");

            // 1. Check email availability (case insensitive)
            const { data: existingEmail, error: emailCheckError } = await supabase
                .from('userinfo')
                .select('user_email')
                .ilike('user_email', userData.email)
                .maybeSingle();

            if (existingEmail) {
                throw new Error('This email is already registered. Please login.');
            }

            // 2. Create auth user
            console.log("Creating auth user");
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
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

            const { error: insertError } = await supabase.from('userinfo').insert({
                user_roles: 'Patient',
                arabic_username_a: userData.arabicName,
                arabic_username_b: userData.arabicName,
                arabic_username_c: userData.arabicName,
                arabic_username_d: userData.arabicName,
                english_username_a: userData.englishName,
                english_username_b: userData.englishName,
                english_username_c: userData.englishName,
                english_username_d: userData.englishName,
                user_email: userData.email,
                user_phonenumber: userData.phoneNumber,
                date_of_birth: userData.dateOfBirth,
                gender_user: userData.gender,
                user_password: userData.password,
                created_at: currentTimestamp,
                updated_at: currentTimestamp,
                pdated_at: currentTimestamp
            });

            if (insertError) {
                console.error('Profile creation error:', insertError);
                // Try to rollback auth user if profile creation fails
                await supabase.auth.signOut();
                throw new Error(`Failed to create profile: ${insertError.message}`);
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
            setUser(null);
            // Clear any login flags
            localStorage.removeItem('loginSuccess');
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