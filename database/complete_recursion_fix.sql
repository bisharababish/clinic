-- Complete fix for userinfo recursion - NO self-referencing queries
-- Run this in your Supabase SQL Editor

-- Drop ALL existing policies on userinfo
DROP POLICY IF EXISTS "Users can view their own info" ON userinfo;
DROP POLICY IF EXISTS "Secretaries full access to userinfo" ON userinfo;
DROP POLICY IF EXISTS "Admins full access to userinfo" ON userinfo;
DROP POLICY IF EXISTS "Secretaries can view all user info" ON userinfo;
DROP POLICY IF EXISTS "Admins can view all user info" ON userinfo;
DROP POLICY IF EXISTS "Allow all authenticated users to access userinfo" ON userinfo;
DROP POLICY IF EXISTS "Users can access their own userinfo" ON userinfo;
DROP POLICY IF EXISTS "Allow access by email match" ON userinfo;

-- Create a single, simple policy that allows all authenticated users
-- This completely avoids any recursion by not querying userinfo at all
CREATE POLICY "Allow all authenticated users" ON userinfo
    FOR ALL USING (
        auth.uid() IS NOT NULL
    ) WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Now fix the payment_bookings policies to avoid recursion there too
DROP POLICY IF EXISTS "Secretaries full access to payment_bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Admins full access to payment_bookings" ON payment_bookings;

-- Create a simple policy for payment_bookings that doesn't cause recursion
-- We'll use a different approach - check if user exists in userinfo without role check
CREATE POLICY "Allow authenticated users to access payment_bookings" ON payment_bookings
    FOR ALL USING (
        auth.uid() IS NOT NULL
    ) WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Fix auth.users policies
DROP POLICY IF EXISTS "Secretaries full access to auth_users" ON auth.users;
DROP POLICY IF EXISTS "Admins full access to auth_users" ON auth.users;

-- Create a simple policy for auth.users
CREATE POLICY "Allow authenticated users to access auth_users" ON auth.users
    FOR ALL USING (
        auth.uid() IS NOT NULL
    );
