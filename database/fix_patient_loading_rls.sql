-- COMPREHENSIVE RLS FIX FOR PATIENT LOADING ISSUES
-- This should fix the patient tabs not loading issue
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "userinfo_no_recursion" ON userinfo;
DROP POLICY IF EXISTS "auth_users_no_recursion" ON auth.users;
DROP POLICY IF EXISTS "payment_bookings_no_recursion" ON payment_bookings;
DROP POLICY IF EXISTS "payment_transactions_no_recursion" ON payment_transactions;

-- Step 2: Temporarily disable RLS on all tables
ALTER TABLE userinfo DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS with simple, working policies
ALTER TABLE userinfo ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple policies that allow all authenticated users
-- This is a temporary fix to get patient loading working
CREATE POLICY "userinfo_allow_all_authenticated" ON userinfo
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "payment_bookings_allow_all_authenticated" ON payment_bookings
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "payment_transactions_allow_all_authenticated" ON payment_transactions
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 5: Also ensure patient_health_info table has proper access
-- Drop existing policies on patient_health_info
DROP POLICY IF EXISTS "patient_health_info_allow_all" ON patient_health_info;
DROP POLICY IF EXISTS "patient_health_info_allow_all_authenticated" ON patient_health_info;

-- Enable RLS on patient_health_info
ALTER TABLE patient_health_info ENABLE ROW LEVEL SECURITY;

-- Create policy for patient_health_info
CREATE POLICY "patient_health_info_allow_all_authenticated" ON patient_health_info
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 6: Also fix lab_results table if it exists
DROP POLICY IF EXISTS "lab_results_allow_all" ON lab_results;
DROP POLICY IF EXISTS "lab_results_allow_all_authenticated" ON lab_results;

-- Enable RLS on lab_results
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- Create policy for lab_results
CREATE POLICY "lab_results_allow_all_authenticated" ON lab_results
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 7: Fix xray_images table if it exists
DROP POLICY IF EXISTS "xray_images_allow_all" ON xray_images;
DROP POLICY IF EXISTS "xray_images_allow_all_authenticated" ON xray_images;

-- Enable RLS on xray_images
ALTER TABLE xray_images ENABLE ROW LEVEL SECURITY;

-- Create policy for xray_images
CREATE POLICY "xray_images_allow_all_authenticated" ON xray_images
    FOR ALL USING (auth.uid() IS NOT NULL);
