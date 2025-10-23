-- Full access RLS policies for Secretary and Admin roles
-- Run this in your Supabase SQL Editor

-- First, drop all existing policies on payment_bookings
DROP POLICY IF EXISTS "Users can view their own payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Admins can view all payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Secretaries can view all payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Doctors can view payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Nurses can view payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Users can insert their own payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Admins can update payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Secretaries can update payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON payment_bookings;

-- Create comprehensive policy for Secretaries - full access to payment_bookings
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

-- Create comprehensive policy for Admins - full access to payment_bookings
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

-- Now fix the auth.users table access
-- Drop all existing policies on auth.users
DROP POLICY IF EXISTS "Users can view their own auth record" ON auth.users;
DROP POLICY IF EXISTS "Admins can view all auth records" ON auth.users;
DROP POLICY IF EXISTS "Secretaries can view all auth records" ON auth.users;
DROP POLICY IF EXISTS "Doctors can view auth records" ON auth.users;
DROP POLICY IF EXISTS "Nurses can view auth records" ON auth.users;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON auth.users;

-- Create comprehensive policy for Secretaries - full access to auth.users
CREATE POLICY "Secretaries full access to auth_users" ON auth.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Secretary'
        )
    );

-- Create comprehensive policy for Admins - full access to auth.users
CREATE POLICY "Admins full access to auth_users" ON auth.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Admin'
        )
    );

-- Also ensure userinfo table has proper access
-- Drop existing policies on userinfo
DROP POLICY IF EXISTS "Users can view their own info" ON userinfo;
DROP POLICY IF EXISTS "Secretaries can view all user info" ON userinfo;
DROP POLICY IF EXISTS "Admins can view all user info" ON userinfo;

-- Create policy for users to view their own info
CREATE POLICY "Users can view their own info" ON userinfo
    FOR SELECT USING (id = auth.uid());

-- Create comprehensive policy for Secretaries - full access to userinfo
CREATE POLICY "Secretaries full access to userinfo" ON userinfo
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Secretary'
        )
    );

-- Create comprehensive policy for Admins - full access to userinfo
CREATE POLICY "Admins full access to userinfo" ON userinfo
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Admin'
        )
    );
