-- FIXED VERSION - No auth.users modifications
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL policies on userinfo
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
DROP POLICY IF EXISTS "userinfo_simple" ON userinfo;
DROP POLICY IF EXISTS "userinfo_policy" ON userinfo;

-- Step 2: Temporarily disable RLS on userinfo
ALTER TABLE userinfo DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS on userinfo
ALTER TABLE userinfo ENABLE ROW LEVEL SECURITY;

-- Step 4: Create ONE simple policy - NO table queries
CREATE POLICY "userinfo_no_recursion" ON userinfo
    FOR ALL USING (true) WITH CHECK (true);

-- Step 5: Fix payment_bookings (skip auth.users - it's a system table)
DROP POLICY IF EXISTS "payment_bookings_simple" ON payment_bookings;
DROP POLICY IF EXISTS "payment_bookings_policy" ON payment_bookings;
DROP POLICY IF EXISTS "payment_bookings_access" ON payment_bookings;
DROP POLICY IF EXISTS "Allow authenticated users to access payment_bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Secretaries full access to payment_bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Admins full access to payment_bookings" ON payment_bookings;

CREATE POLICY "payment_bookings_no_recursion" ON payment_bookings
    FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Fix payment_transactions
DROP POLICY IF EXISTS "payment_transactions_simple" ON payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_policy" ON payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_access" ON payment_transactions;

CREATE POLICY "payment_transactions_no_recursion" ON payment_transactions
    FOR ALL USING (true) WITH CHECK (true);
