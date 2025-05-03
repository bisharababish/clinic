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

        if (error) throw error;

        // If no admin exists, create one
        if (!adminUsers || adminUsers.length === 0) {
          console.log('No admin user found. Creating default admin...');
          
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
        }
      } catch (error) {
        console.error('Error setting up initial data:', error);
      } finally {
        setIsChecking(false);
      }
    };

    setupInitialData();
  }, []);

  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Initializing Database...</h2>
          <p className="text-sm text-muted-foreground">Please wait while the system is being set up.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default DatabaseSync;