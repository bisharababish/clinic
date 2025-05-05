// Fixed useAuth.tsx - Patient Registration and Login

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

    useEffect(() => {
        // Check for active session on mount
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const { data: userData } = await supabase
                        .from('userinfo')
                        .select('*')
                        .eq('user_email', session.user.email)
                        .single();

                    if (userData) {
                        setUser({
                            id: userData.userid.toString(),
                            email: userData.user_email,
                            name: userData.english_username_a,
                            role: userData.user_roles.toLowerCase() as UserRole
                        });
                    }
                }
            } catch (error) {
                console.error('Session check error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const { data: userData } = await supabase
                        .from('userinfo')
                        .select('*')
                        .eq('user_email', session.user.email)
                        .single();

                    if (userData) {
                        setUser({
                            id: userData.userid.toString(),
                            email: userData.user_email,
                            name: userData.english_username_a,
                            role: userData.user_roles.toLowerCase() as UserRole
                        });
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

    // Fixed signup function in useAuth.tsx 

    // 1. First, update the login function to handle missing profiles
    const login = async (email: string, password: string): Promise<User> => {
        setIsLoading(true);

        try {
            // Step 1: Try to login with Supabase Auth first
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                console.error('Auth login error:', authError);
                throw new Error('Invalid email or password');
            }

            if (!authData.user) {
                throw new Error('Authentication failed');
            }

            // Step 2: Get user data from database
            const { data: userData, error: dbError } = await supabase
                .from('userinfo')
                .select('*')
                .eq('user_email', email)
                .single();

            // Step 3: Check if userData exists
            if (!userData || dbError) {
                console.log('User profile not found, creating one...');

                // Create a new profile if it doesn't exist
                const currentTimestamp = new Date().toISOString();

                const { error: createError } = await supabase.from('userinfo').insert({
                    user_roles: 'Patient',
                    arabic_username_a: email, // Fallback
                    arabic_username_b: email,
                    arabic_username_c: email,
                    arabic_username_d: email,
                    english_username_a: authData.user.email || email,
                    english_username_b: authData.user.email || email,
                    english_username_c: authData.user.email || email,
                    english_username_d: authData.user.email || email,
                    user_email: email,
                    user_phonenumber: '',
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

                // Fetch the newly created profile
                const { data: newUserData, error: newFetchError } = await supabase
                    .from('userinfo')
                    .select('*')
                    .eq('user_email', email)
                    .single();

                if (newFetchError || !newUserData) {
                    console.error('Error fetching new profile:', newFetchError);
                    throw new Error('Failed to fetch user profile');
                }

                // Set the user with the new profile
                const userObj: User = {
                    id: newUserData.userid.toString(),
                    email: newUserData.user_email,
                    name: newUserData.english_username_a,
                    role: newUserData.user_roles.toLowerCase() as UserRole
                };

                setUser(userObj);
                return userObj;
            }

            // If userData exists, use it
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

    // 2. Update the signup function to ensure it works correctly
    const signup = async (userData: SignupData) => {
        setIsLoading(true);

        try {
            // 1. Check email availability 
            const { data: existingEmail, error: emailCheckError } = await supabase
                .from('userinfo')
                .select('user_email')
                .eq('user_email', userData.email)
                .maybeSingle();

            if (existingEmail) {
                throw new Error('This email is already registered. Please login.');
            }

            // 2. Create auth user with proper redirect URLs
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        name: userData.englishName
                    }
                }
            });

            if (authError) {
                console.error('Auth signup error:', authError);
                throw authError;
            }

            // 3. Create user profile
            const currentTimestamp = new Date().toISOString();

            const { error: profileError } = await supabase.from('userinfo').insert({
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

            if (profileError) {
                console.error('Profile creation error:', profileError);
                throw new Error(`Failed to create profile: ${profileError.message}`);
            }

            // 4. Try auto-login if no email confirmation required
            try {
                await login(userData.email, userData.password);
            } catch (loginError) {
                console.log('Auto-login after signup failed:', loginError);
                // This is not critical, so we don't throw or rethrow
            }

        } catch (error) {
            setIsLoading(false);
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