-- COMPREHENSIVE RLS FIX - Fix all table access issues
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL existing policies on ALL tables
-- userinfo table
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
DROP POLICY IF EXISTS "userinfo_policy" ON userinfo;

-- auth.users table
DROP POLICY IF EXISTS "Users can view their own auth record" ON auth.users;
DROP POLICY IF EXISTS "Admins can view all auth records" ON auth.users;
DROP POLICY IF EXISTS "Secretaries can view all auth records" ON auth.users;
DROP POLICY IF EXISTS "Doctors can view auth records" ON auth.users;
DROP POLICY IF EXISTS "Nurses can view auth records" ON auth.users;
DROP POLICY IF EXISTS "Secretaries full access to auth_users" ON auth.users;
DROP POLICY IF EXISTS "Admins full access to auth_users" ON auth.users;
DROP POLICY IF EXISTS "Allow authenticated users to access auth_users" ON auth.users;
DROP POLICY IF EXISTS "auth_users_access" ON auth.users;
DROP POLICY IF EXISTS "auth_users_policy" ON auth.users;

-- payment_bookings table
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
DROP POLICY IF EXISTS "payment_bookings_policy" ON payment_bookings;

-- payment_transactions table (if it exists)
DROP POLICY IF EXISTS "Users can view their own payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Admins can view all payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Secretaries can view all payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_policy" ON payment_transactions;

-- Step 2: Create simple, working policies for all tables
-- userinfo table - allow all authenticated users
CREATE POLICY "userinfo_simple" ON userinfo
    FOR ALL USING (auth.uid() IS NOT NULL);

-- auth.users table - allow all authenticated users  
CREATE POLICY "auth_users_simple" ON auth.users
    FOR ALL USING (auth.uid() IS NOT NULL);

-- payment_bookings table - allow all authenticated users
CREATE POLICY "payment_bookings_simple" ON payment_bookings
    FOR ALL USING (auth.uid() IS NOT NULL);

-- payment_transactions table - allow all authenticated users (if table exists)
CREATE POLICY "payment_transactions_simple" ON payment_transactions
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 3: Ensure RLS is enabled on all tables
ALTER TABLE userinfo ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
