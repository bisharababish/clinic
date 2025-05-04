// utils/migrateUsers.ts
import { supabase } from '../lib/supabase';

export const migrateExistingUsers = async () => {
    try {
        console.log('Starting user migration...');

        // Fetch all users from database
        const { data: users, error } = await supabase
            .from('userinfo')
            .select('*');

        if (error) throw error;

        for (const user of users) {
            try {
                // Create auth user for each database user
                const { error: signupError } = await supabase.auth.signUp({
                    email: user.user_email,
                    password: user.user_password,
                    options: {
                        emailRedirectTo: window.location.origin,
                    }
                });

                if (signupError && !signupError.message.includes('User already registered')) {
                    console.error(`Error creating auth user for ${user.user_email}:`, signupError);
                } else {
                    console.log(`Successfully created auth user for ${user.user_email}`);
                }
            } catch (userError) {
                console.error(`Error processing user ${user.user_email}:`, userError);
            }
        }

        console.log('User migration complete');
    } catch (error) {
        console.error('Error during user migration:', error);
        throw error;
    }
};

// Function to create default admin if not exists
export const createDefaultAdmin = async () => {
    try {
        // Check if admin exists
        const { data: adminUser, error: adminError } = await supabase
            .from('userinfo')
            .select('*')
            .eq('user_email', 'admin@clinic.com')
            .single();

        if (adminError || !adminUser) {
            // Create admin user in database
            const { error: insertError } = await supabase.from('userinfo').insert({
                userid: 1,
                user_roles: 'Admin',
                english_username_a: 'System Admin',
                english_username_b: 'System Admin',
                english_username_c: 'System Admin',
                english_username_d: 'System Admin',
                arabic_username_a: 'مدير النظام',
                arabic_username_b: 'مدير النظام',
                arabic_username_c: 'مدير النظام',
                arabic_username_d: 'مدير النظام',
                user_email: 'admin@clinic.com',
                user_password: 'password123',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (insertError) throw insertError;
        }

        // Create admin auth user
        const { error: authError } = await supabase.auth.signUp({
            email: 'admin@clinic.com',
            password: 'password123',
            options: {
                emailRedirectTo: window.location.origin,
            }
        });

        if (authError && !authError.message.includes('User already registered')) {
            throw authError;
        }

        console.log('Default admin created/verified successfully');
    } catch (error) {
        console.error('Error creating default admin:', error);
        throw error;
    }
};