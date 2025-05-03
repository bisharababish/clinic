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
            try {
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
                            name: userData.english_username_a,
                            role: userData.user_roles.toLowerCase() as UserRole
                        });
                    } else {
                        // Session exists but no user info, sign out
                        await supabase.auth.signOut();
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
                console.log('Auth state change:', event);

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

    const login = async (email: string, password: string): Promise<User> => {
        setIsLoading(true);

        try {
            // First, check if user exists in database with matching credentials
            const { data: userData, error: userError } = await supabase
                .from('userinfo')
                .select('*')
                .eq('user_email', email)
                .eq('user_password', password)
                .single();

            if (userError || !userData) {
                throw new Error('Invalid email or password');
            }

            // Create auth session without requiring Supabase auth signup
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            // If auth fails but user exists in database, create auth user
            if (authError) {
                if (authError.message.includes('Invalid login credentials')) {
                    const { error: signupError } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            emailRedirectTo: window.location.origin,
                        }
                    });

                    if (signupError) throw signupError;

                    // Try login again
                    const { error: retryError } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (retryError) throw retryError;
                } else {
                    throw authError;
                }
            }

            // Set user data in state
            const userObj: User = {
                id: userData.userid.toString(),
                email: userData.user_email,
                name: userData.english_username_a,
                role: userData.user_roles.toLowerCase() as UserRole
            };

            setUser(userObj);
            setIsLoading(false);
            return userObj;
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
                password: userData.password,
                options: {
                    emailRedirectTo: window.location.origin,
                }
            });

            if (authError) throw authError;

            // Get the highest userid and increment
            const { data: maxUserData, error: maxError } = await supabase
                .from('userinfo')
                .select('userid')
                .order('userid', { ascending: false })
                .limit(1);

            let newUserId = 1;
            if (!maxError && maxUserData && maxUserData.length > 0) {
                newUserId = maxUserData[0].userid + 1;
            }

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
                user_password: userData.password,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (profileError) {
                console.error("Profile creation error:", profileError);
                await supabase.auth.signOut();
                throw new Error(`Profile creation failed: ${profileError.message}`);
            }

            setIsLoading(false);
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};