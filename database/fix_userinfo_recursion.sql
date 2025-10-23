-- Fix infinite recursion in userinfo RLS policies
-- Run this in your Supabase SQL Editor

-- Drop all existing policies on userinfo to fix recursion
DROP POLICY IF EXISTS "Users can view their own info" ON userinfo;
DROP POLICY IF EXISTS "Secretaries full access to userinfo" ON userinfo;
DROP POLICY IF EXISTS "Admins full access to userinfo" ON userinfo;
DROP POLICY IF EXISTS "Secretaries can view all user info" ON userinfo;
DROP POLICY IF EXISTS "Admins can view all user info" ON userinfo;

-- Create a simple policy that allows all authenticated users to access userinfo
-- This avoids recursion by not querying userinfo from within its own policy
CREATE POLICY "Allow all authenticated users to access userinfo" ON userinfo
    FOR ALL USING (
        auth.uid() IS NOT NULL
    ) WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Keep the payment_bookings policies as they are (they should work fine)
-- Drop and recreate payment_bookings policies to ensure they're clean
DROP POLICY IF EXISTS "Secretaries full access to payment_bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Admins full access to payment_bookings" ON payment_bookings;

-- Create policy for Secretaries - full access to payment_bookings
CREATE POLICY "Secretaries full access to payment_bookings" ON payment_bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Secretary'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Secretary'
        )
    );

-- Create policy for Admins - full access to payment_bookings
CREATE POLICY "Admins full access to payment_bookings" ON payment_bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Admin'
        )
    );

-- Keep the auth.users policies as they are
-- Drop and recreate auth.users policies to ensure they're clean
DROP POLICY IF EXISTS "Secretaries full access to auth_users" ON auth.users;
DROP POLICY IF EXISTS "Admins full access to auth_users" ON auth.users;

-- Create policy for Secretaries - full access to auth.users
CREATE POLICY "Secretaries full access to auth_users" ON auth.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Secretary'
        )
    );

-- Create policy for Admins - full access to auth.users
CREATE POLICY "Admins full access to auth_users" ON auth.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Admin'
        )
    );
