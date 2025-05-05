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

            // 2. FIXED: Get next available userid more reliably
            let newUserId = 1;
            const { data: maxUserData, error: maxError } = await supabase
                .from('userinfo')
                .select('userid')
                .order('userid', { ascending: false })
                .limit(1)
                .maybeSingle(); // Use maybeSingle() to handle case when no users exist

            if (maxError && maxError.code !== 'PGRST116') { // PGRST116 means no rows found
                throw maxError;
            }

            if (maxUserData && maxUserData.userid) {
                newUserId = maxUserData.userid + 1;
            }

            console.log('Assigning new userid:', newUserId); // Debug log

            // 3. Create auth user
            const { error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (authError && !authError.message.includes('already registered')) {
                throw authError;
            }

            // 4. Create user profile with all required fields
            const currentTimestamp = new Date().toISOString();

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
                created_at: currentTimestamp,
                updated_at: currentTimestamp,
                pdated_at: currentTimestamp // Keep this field to match your table
            });

            if (profileError) {
                console.error('Profile creation error:', profileError); // Debug log
                // Rollback auth user if profile creation fails
                await supabase.auth.signOut();
                throw new Error(`Failed to create profile: ${profileError.message}`);
            }

            console.log('User profile created successfully'); // Debug log

        } catch (error) {
            setIsLoading(false);
            console.error('Signup error:', error); // Debug log
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    const login = async (email: string, password: string): Promise<User> => {
        setIsLoading(true);

        try {
            // 1. Try to login with Supabase Auth
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                throw new Error('Invalid email or password');
            }

            // 2. Get user data from database
            const { data: userData, error: dbError } = await supabase
                .from('userinfo')
                .select('*')
                .eq('user_email', email)
                .single();

            if (!userData || dbError) {
                throw new Error('User profile not found');
            }

            // 3. Set user data in context
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