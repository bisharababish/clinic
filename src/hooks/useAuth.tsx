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
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            // User info will be set by the auth state change listener
        } catch (error) {
            console.error('Error logging in:', error);
            setIsLoading(false);
            throw error;
        }
    };

    const signup = async (userData: SignupData) => {
        setIsLoading(true);

        try {
            // Create auth user first
            const { error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password
            });

            if (authError) throw authError;

            // Get the next available user ID
            const { data: maxIdData } = await supabase
                .from('userinfo')
                .select('userid')
                .order('userid', { ascending: false })
                .limit(1);

            const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].userid + 1 : 1;

            // Insert into userinfo table
            const { error: insertError } = await supabase.from('userinfo').insert({
                userid: nextId,
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
                user_password: userData.password, // This will be hashed by your database trigger
            });

            if (insertError) throw insertError;

            // User info will be set by the auth state change listener
        } catch (error) {
            console.error('Error signing up:', error);
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