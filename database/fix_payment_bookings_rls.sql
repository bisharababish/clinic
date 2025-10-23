-- Fix RLS policies for payment_bookings table
-- This script sets up proper Row Level Security policies

-- Enable RLS on payment_bookings table
ALTER TABLE payment_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Admins can view all payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Secretaries can view all payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Doctors can view payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Nurses can view payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Users can insert their own payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Admins can update payment bookings" ON payment_bookings;
DROP POLICY IF EXISTS "Secretaries can update payment bookings" ON payment_bookings;

-- Create policy for users to view their own payment bookings
CREATE POLICY "Users can view their own payment bookings" ON payment_bookings
    FOR SELECT USING (
        patient_id = auth.uid()
    );

-- Create policy for admins to view all payment bookings
CREATE POLICY "Admins can view all payment bookings" ON payment_bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Admin'
        )
    );

-- Create policy for secretaries to view all payment bookings
CREATE POLICY "Secretaries can view all payment bookings" ON payment_bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Secretary'
        )
    );

-- Create policy for doctors to view payment bookings
CREATE POLICY "Doctors can view payment bookings" ON payment_bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Doctor'
        )
    );

-- Create policy for nurses to view payment bookings
CREATE POLICY "Nurses can view payment bookings" ON payment_bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Nurse'
        )
    );

-- Create policy for users to insert their own payment bookings
CREATE POLICY "Users can insert their own payment bookings" ON payment_bookings
    FOR INSERT WITH CHECK (
        patient_id = auth.uid()
    );

-- Create policy for admins to update payment bookings
CREATE POLICY "Admins can update payment bookings" ON payment_bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Admin'
        )
    );

-- Create policy for secretaries to update payment bookings
CREATE POLICY "Secretaries can update payment bookings" ON payment_bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Secretary'
        )
    );

-- Also need to fix the auth.users table access
-- Enable RLS on auth.users table (if not already enabled)
-- Note: This might need to be done through Supabase dashboard as auth.users is a system table

-- Create a policy for users to view their own auth.users record
-- This is needed for the payment_bookings queries that join with auth.users
CREATE POLICY "Users can view their own auth record" ON auth.users
    FOR SELECT USING (
        id = auth.uid()
    );

-- Create policy for admins to view all auth.users records
CREATE POLICY "Admins can view all auth records" ON auth.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Admin'
        )
    );

-- Create policy for secretaries to view all auth.users records
CREATE POLICY "Secretaries can view all auth records" ON auth.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Secretary'
        )
    );

-- Create policy for doctors to view auth.users records
CREATE POLICY "Doctors can view auth records" ON auth.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Doctor'
        )
    );

-- Create policy for nurses to view auth.users records
CREATE POLICY "Nurses can view auth records" ON auth.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM userinfo 
            WHERE id = auth.uid() 
            AND user_roles = 'Nurse'
        )
    );
