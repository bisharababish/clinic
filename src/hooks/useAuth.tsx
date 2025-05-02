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
    login: (email: string, password: string) => Promise<void>;
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
            setIsLoading(true);
            const { data, error } = await supabase.auth.getSession();

            if (!error && data.session) {
                const { data: userData, error: userError } = await supabase
                    .from('userinfo')
                    .select('*')
                    .eq('user_email', data.session.user.email)
                    .single();

                if (!userError && userData) {
                    setUser({
                        id: userData.userid.toString(),
                        email: userData.user_email,
                        name: userData.english_username_a, // Using English name as the display name
                        role: userData.user_roles.toLowerCase() as UserRole
                    });
                }
            }

            setIsLoading(false);
        };

        checkSession();

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    const { data: userData, error: userError } = await supabase
                        .from('userinfo')
                        .select('*')
                        .eq('user_email', session.user.email)
                        .single();

                    if (!userError && userData) {
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

    const login = async (email: string, password: string) => {
        setIsLoading(true);

        try {
            // Authenticate with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            console.log("Auth successful:", authData); // Debug log

            // Fetch user data from your userinfo table
            const { data: userData, error: userError } = await supabase
                .from('userinfo')
                .select('*')
                .eq('user_email', email)
                .single();

            if (userError) {
                console.error("Error fetching user data:", userError);
                throw userError;
            }

            console.log("User data fetched:", userData); // Debug log

            // Set user data in state
            setUser({
                id: userData.userid.toString(),
                email: userData.user_email,
                name: userData.english_username_a,
                role: userData.user_roles.toLowerCase()
            });

            setIsLoading(false);
            return userData; // Return user data for navigation
        } catch (error) {
            console.error('Error logging in:', error);
            setIsLoading(false);
            throw error;
        }
    };
    const signup = async (userData: SignupData) => {
        setIsLoading(true);

        try {
            // First create the auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password
            });

            if (authError) throw authError;

            console.log("Auth user created:", authData); // Debug logging

            // Generate a user ID (either get the next available or use UUID)
            const newUserId = Date.now(); // Simple approach for testing

            // Then create the user profile
            const { error: profileError } = await supabase.from('userinfo').insert({
                userid: newUserId,
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
                user_password: userData.password
            });

            if (profileError) {
                console.error("Profile creation error:", profileError);

                // If profile creation fails, delete the auth user to avoid orphaned auth accounts
                await supabase.auth.signOut();

                throw new Error(`Profile creation failed: ${profileError.message}`);
            }

            // Success! No need to set user here as the auth state listener will do that
        } catch (error) {
            console.error("Registration error:", error);
            setIsLoading(false);
            throw error;
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};