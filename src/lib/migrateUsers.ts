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

        console.log(`Found ${users?.length || 0} users to migrate`);

        if (!users || users.length === 0) {
            console.log('No users found to migrate');
            return;
        }

        for (const user of users) {
            try {
                // Create auth user for each database user
                const { error: signupError } = await supabase.auth.signUp({
                    email: user.user_email,
                    password: user.user_password || 'defaultPassword123', // Fallback password
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                });

                if (signupError && !signupError.message.includes('User already registered')) {
                    console.error(`Error creating auth user for ${user.user_email}:`, signupError);
                } else {
                    console.log(`Successfully processed auth user for ${user.user_email}`);
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
        console.log('Checking for default admin...');

        // Check if admin exists
        const { data: adminUser, error: adminError } = await supabase
            .from('userinfo')
            .select('*')
            .eq('user_email', 'admin@clinic.com')
            .single();

        if (adminError && adminError.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected if admin doesn't exist
            throw adminError;
        }

        if (!adminUser) {
            console.log('Creating default admin user...');

            const currentTimestamp = new Date().toISOString();

            // Create admin user in database (remove explicit userid to let it auto-increment)
            const { data: insertData, error: insertError } = await supabase
                .from('userinfo')
                .insert({
                    user_roles: 'Admin',
                    english_username_a: 'System',
                    english_username_b: 'Admin',
                    english_username_c: 'User',
                    english_username_d: 'Default',
                    arabic_username_a: 'مدير',
                    arabic_username_b: 'النظام',
                    arabic_username_c: 'الافتراضي',
                    arabic_username_d: 'الرئيسي',
                    user_email: 'admin@clinic.com',
                    user_password: 'password123',
                    user_phonenumber: '0000000000',
                    date_of_birth: currentTimestamp,
                    gender_user: 'unknown',
                    created_at: currentTimestamp,
                    updated_at: currentTimestamp,
                    pdated_at: currentTimestamp // Keep this typo if it exists in your schema
                })
                .select();

            if (insertError) {
                console.error('Error inserting admin user:', insertError);
                throw insertError;
            }

            console.log('Admin user created in database:', insertData);
        } else {
            console.log('Admin user already exists in database');
        }

        // Create admin auth user
        console.log('Creating/verifying admin auth user...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: 'admin@clinic.com',
            password: 'password123',
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
        });

        if (authError) {
            if (authError.message.includes('User already registered')) {
                console.log('Admin auth user already exists');
            } else {
                console.error('Error creating admin auth user:', authError);
                throw authError;
            }
        } else {
            console.log('Admin auth user created successfully');
        }

        console.log('Default admin setup completed successfully');
    } catch (error) {
        console.error('Error creating default admin:', error);
        // Don't throw the error to prevent app from failing to load
        // Just log it and continue
        console.warn('Admin creation failed, but app will continue to load');
    }
};