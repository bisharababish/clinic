-- Keep RLS Enabled - Fix Patient Loading Issues
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL existing problematic policies
DROP POLICY IF EXISTS "userinfo_policy" ON userinfo;
DROP POLICY IF EXISTS "userinfo_allow_all_authenticated" ON userinfo;
DROP POLICY IF EXISTS "userinfo_no_recursion" ON userinfo;
DROP POLICY IF EXISTS "userinfo_simple" ON userinfo;
DROP POLICY IF EXISTS "Allow all authenticated users" ON userinfo;
DROP POLICY IF EXISTS "Users can access their own userinfo" ON userinfo;
DROP POLICY IF EXISTS "Allow access by email match" ON userinfo;

DROP POLICY IF EXISTS "payment_bookings_policy" ON payment_bookings;
DROP POLICY IF EXISTS "payment_bookings_allow_all_authenticated" ON payment_bookings;
DROP POLICY IF EXISTS "payment_bookings_no_recursion" ON payment_bookings;
DROP POLICY IF EXISTS "payment_bookings_simple" ON payment_bookings;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON payment_bookings;

DROP POLICY IF EXISTS "payment_transactions_policy" ON payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_allow_all_authenticated" ON payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_no_recursion" ON payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_simple" ON payment_transactions;

DROP POLICY IF EXISTS "patient_health_info_policy" ON patient_health_info;
DROP POLICY IF EXISTS "patient_health_info_allow_all_authenticated" ON patient_health_info;
DROP POLICY IF EXISTS "patient_health_info_no_recursion" ON patient_health_info;

DROP POLICY IF EXISTS "lab_results_policy" ON lab_results;
DROP POLICY IF EXISTS "lab_results_allow_all_authenticated" ON lab_results;

DROP POLICY IF EXISTS "xray_images_policy" ON xray_images;
DROP POLICY IF EXISTS "xray_images_allow_all_authenticated" ON xray_images;

-- Step 2: Ensure RLS is enabled on all tables
ALTER TABLE userinfo ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_health_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE xray_images ENABLE ROW LEVEL SECURITY;

-- Step 3: Create proper working policies that allow authenticated users
-- These policies use auth.uid() which is safe and doesn't cause recursion

-- Userinfo policy - allows all authenticated users to access all userinfo records
CREATE POLICY "userinfo_authenticated_access" ON userinfo
    FOR ALL USING (
        auth.uid() IS NOT NULL
    );

-- Payment bookings policy - allows all authenticated users
CREATE POLICY "payment_bookings_authenticated_access" ON payment_bookings
    FOR ALL USING (
        auth.uid() IS NOT NULL
    );

-- Payment transactions policy - allows all authenticated users
CREATE POLICY "payment_transactions_authenticated_access" ON payment_transactions
    FOR ALL USING (
        auth.uid() IS NOT NULL
    );

-- Patient health info policy - allows all authenticated users
CREATE POLICY "patient_health_info_authenticated_access" ON patient_health_info
    FOR ALL USING (
        auth.uid() IS NOT NULL
    );

-- Lab results policy - allows all authenticated users
CREATE POLICY "lab_results_authenticated_access" ON lab_results
    FOR ALL USING (
        auth.uid() IS NOT NULL
    );

-- X-ray images policy - allows all authenticated users
CREATE POLICY "xray_images_authenticated_access" ON xray_images
    FOR ALL USING (
        auth.uid() IS NOT NULL
    );
