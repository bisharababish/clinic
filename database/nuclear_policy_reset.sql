-- NUCLEAR OPTION: Complete policy reset to fix recursion
-- Run this in your Supabase SQL Editor

-- STEP 1: Drop ALL policies on userinfo table
DROP POLICY IF EXISTS "Users can view their own info" ON userinfo;
DROP POLICY IF EXISTS "Secretaries full access to userinfo" ON userinfo;
DROP POLICY IF EXISTS "Admins full access to userinfo" ON userinfo;
DROP POLICY IF EXISTS "Secretaries can view all user info" ON userinfo;
DROP POLICY IF EXISTS "Admins can view all user info" ON userinfo;
DROP POLICY IF EXISTS "Allow all authenticated users to access userinfo" ON userinfo;
DROP POLICY IF EXISTS "Users can access their own userinfo" ON userinfo;
DROP POLICY IF EXISTS "Allow access by email match" ON userinfo;
DROP POLICY IF EXISTS "Allow all authenticated users" ON userinfo;
DROP POLICY IF EXISTS "Users can view their own auth record" ON auth.users;
DROP POLICY IF EXISTS "Admins can view all auth records" ON auth.users;
DROP POLICY IF EXISTS "Secretaries can view all auth records" ON auth.users;
DROP POLICY IF EXISTS "Doctors can view auth records" ON auth.users;
DROP POLICY IF EXISTS "Nurses can view auth records" ON auth.users;
DROP POLICY IF EXISTS "Secretaries full access to auth_users" ON auth.users;
DROP POLICY IF EXISTS "Admins full access to auth_users" ON auth.users;
DROP POLICY IF EXISTS "Allow authenticated users to access auth_users" ON auth.users;

-- STEP 2: Temporarily disable RLS on userinfo to clear any cached policies
ALTER TABLE userinfo DISABLE ROW LEVEL SECURITY;

-- STEP 3: Re-enable RLS on userinfo
ALTER TABLE userinfo ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create ONE simple policy for userinfo
CREATE POLICY "userinfo_access" ON userinfo
    FOR ALL USING (true) WITH CHECK (true);

-- STEP 5: Do the same for auth.users
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_users_access" ON auth.users
    FOR ALL USING (true) WITH CHECK (true);

-- STEP 6: Clean up payment_bookings policies
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

-- STEP 7: Create simple policy for payment_bookings
CREATE POLICY "payment_bookings_access" ON payment_bookings
    FOR ALL USING (true) WITH CHECK (true);
