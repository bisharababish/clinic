-- TARGETED FIX for payment_bookings foreign key access
-- The issue is payment_bookings.patient_id references auth.users(id)
-- Run this in your Supabase SQL Editor

-- Step 1: Drop existing policies on payment_bookings
DROP POLICY IF EXISTS "payment_bookings_simple" ON payment_bookings;
DROP POLICY IF EXISTS "payment_bookings_policy" ON payment_bookings;
DROP POLICY IF EXISTS "payment_bookings_access" ON payment_bookings;
DROP POLICY IF EXISTS "Allow authenticated users to access payment_bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Secretaries full access to payment_bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Admins full access to payment_bookings" ON payment_bookings;

-- Step 2: Create a policy that allows access to payment_bookings
-- This policy needs to work with the foreign key to auth.users
CREATE POLICY "payment_bookings_access" ON payment_bookings
    FOR ALL USING (
        -- Allow if user is authenticated and either:
        -- 1. They are the patient (patient_id matches their auth.uid())
        -- 2. They are an admin or secretary (check via userinfo table)
        auth.uid() IS NOT NULL AND (
            patient_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM userinfo 
                WHERE id = auth.uid() 
                AND user_roles IN ('Admin', 'Secretary')
            )
        )
    ) WITH CHECK (
        auth.uid() IS NOT NULL AND (
            patient_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM userinfo 
                WHERE id = auth.uid() 
                AND user_roles IN ('Admin', 'Secretary')
            )
        )
    );

-- Step 3: Ensure auth.users has proper access for the foreign key
-- Drop existing policies on auth.users
DROP POLICY IF EXISTS "auth_users_simple" ON auth.users;
DROP POLICY IF EXISTS "auth_users_policy" ON auth.users;
DROP POLICY IF EXISTS "auth_users_access" ON auth.users;

-- Create policy for auth.users that allows access for foreign key relationships
CREATE POLICY "auth_users_foreign_key_access" ON auth.users
    FOR ALL USING (
        -- Allow access if:
        -- 1. User is accessing their own record
        -- 2. User is admin or secretary (for managing other users)
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles IN ('Admin', 'Secretary')
        )
    );

-- Step 4: Ensure userinfo has proper access
DROP POLICY IF EXISTS "userinfo_simple" ON userinfo;
DROP POLICY IF EXISTS "userinfo_policy" ON userinfo;

CREATE POLICY "userinfo_access" ON userinfo
    FOR ALL USING (
        -- Allow access if:
        -- 1. User is accessing their own record
        -- 2. User is admin or secretary
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM userinfo u2
            WHERE u2.id = auth.uid() 
            AND u2.user_roles IN ('Admin', 'Secretary')
        )
    );

-- Step 5: Ensure payment_transactions has proper access
DROP POLICY IF EXISTS "payment_transactions_simple" ON payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_policy" ON payment_transactions;

CREATE POLICY "payment_transactions_access" ON payment_transactions
    FOR ALL USING (
        auth.uid() IS NOT NULL AND (
            -- Allow if user is admin or secretary
            EXISTS (
                SELECT 1 FROM userinfo 
                WHERE id = auth.uid() 
                AND user_roles IN ('Admin', 'Secretary')
            ) OR
            -- Allow if user is the patient for this transaction
            EXISTS (
                SELECT 1 FROM payment_bookings pb
                WHERE pb.id = payment_booking_id
                AND pb.patient_id = auth.uid()
            )
        )
    ) WITH CHECK (
        auth.uid() IS NOT NULL AND (
            EXISTS (
                SELECT 1 FROM userinfo 
                WHERE id = auth.uid() 
                AND user_roles IN ('Admin', 'Secretary')
            ) OR
            EXISTS (
                SELECT 1 FROM payment_bookings pb
                WHERE pb.id = payment_booking_id
                AND pb.patient_id = auth.uid()
            )
        )
    );
