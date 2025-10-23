-- COMPLETE RESET - Start from scratch
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL policies on userinfo table
DROP POLICY IF EXISTS "Users can view their own info" ON userinfo;
DROP POLICY IF EXISTS "Secretaries full access to userinfo" ON userinfo;
DROP POLICY IF EXISTS "Admins full access to userinfo" ON userinfo;
DROP POLICY IF EXISTS "Secretaries can view all user info" ON userinfo;
DROP POLICY IF EXISTS "Admins can view all user info" ON userinfo;
DROP POLICY IF EXISTS "Allow all authenticated users to access userinfo" ON userinfo;
DROP POLICY IF EXISTS "Users can access their own userinfo" ON userinfo;
DROP POLICY IF EXISTS "Allow access by email match" ON userinfo;
DROP POLICY IF EXISTS "Allow all authenticated users" ON userinfo;
DROP POLICY IF EXISTS "userinfo_access" ON userinfo;

-- Step 2: Drop ALL policies on auth.users table
DROP POLICY IF EXISTS "Users can view their own auth record" ON auth.users;
DROP POLICY IF EXISTS "Admins can view all auth records" ON auth.users;
DROP POLICY IF EXISTS "Secretaries can view all auth records" ON auth.users;
DROP POLICY IF EXISTS "Doctors can view auth records" ON auth.users;
DROP POLICY IF EXISTS "Nurses can view auth records" ON auth.users;
DROP POLICY IF EXISTS "Secretaries full access to auth_users" ON auth.users;
DROP POLICY IF EXISTS "Admins full access to auth_users" ON auth.users;
DROP POLICY IF EXISTS "Allow authenticated users to access auth_users" ON auth.users;
DROP POLICY IF EXISTS "auth_users_access" ON auth.users;

-- Step 3: Drop ALL policies on payment_bookings table
DROP POLICY IF EXISTS "Users can view their own payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Admins can view all payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Secretaries can view all payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Doctors can view payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Nurses can view payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Users can insert their own payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Admins can update payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Secretaries can update payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON payment_bookings;
DROP POLICY IF EXISTS "Secretaries full access to payment_bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Admins full access to payment_bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Allow authenticated users to access payment_bookings" ON payment_bookings;
DROP POLICY IF EXISTS "payment_bookings_access" ON payment_bookings;

-- Step 4: Create ONE simple policy for each table
-- This allows all authenticated users to access everything
CREATE POLICY "userinfo_policy" ON userinfo
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_policy" ON auth.users
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "payment_bookings_policy" ON payment_bookings
    FOR ALL USING (auth.uid() IS NOT NULL);
