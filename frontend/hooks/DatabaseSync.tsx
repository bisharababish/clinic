// components/utils/DatabaseSync.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const DatabaseSync = () => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const setupInitialData = async () => {
      try {
        // Check if there's any admin user
        const { data: adminUsers, error } = await supabase
          .from('userinfo')
          .select('*')
          .eq('user_roles', 'Admin')
          .limit(1);

        if (error && error.code !== 'PGRST116') { // PGRST116 means relation doesn't exist
          throw error;
        }

        // If no admin exists, create one
        if (!adminUsers || adminUsers.length === 0) {
          console.log('No admin user found. Creating default admin...');

          // Check if table exists first
          const { data: tableExists, error: tableError } = await supabase
            .from('userinfo')
            .select('*')
            .limit(1);

          if (tableError && tableError.code === 'PGRST116') {
            console.log('Table does not exist. Please create the userinfo table in Supabase first.');
            setIsChecking(false);
            return;
          }

          // Create auth user for admin
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

          if (insertError && !insertError.message.includes('duplicate key')) {
            throw insertError;
          }

          console.log('Default admin user created successfully');
        } else {
          console.log('Admin user already exists');
        }
      } catch (error) {
        console.error('Error setting up initial data:', error);
        // If there's an error, we should still proceed
        // This allows the app to continue even if setup fails
      } finally {
        setIsChecking(false);
      }
    };

    setupInitialData();
  }, []);

  // Don't render anything at all during checking
  if (isChecking) {
    return null;
  }

  return null;
};

export default DatabaseSync;
