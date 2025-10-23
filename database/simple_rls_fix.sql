-- Simple RLS fix for payment_bookings table
-- Run this in your Supabase SQL Editor

-- Enable RLS on payment_bookings table
ALTER TABLE payment_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON payment_bookings;

-- Create a simple policy that allows all operations for authenticated users
-- This is a temporary fix to get your system working
CREATE POLICY "Allow all operations for authenticated users" ON payment_bookings
    FOR ALL USING (
        auth.uid() IS NOT NULL
    ) WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Also fix the auth.users table access
-- Enable RLS on auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON auth.users;

-- Create a simple policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON auth.users
    FOR ALL USING (
        auth.uid() IS NOT NULL
    ) WITH CHECK (
        auth.uid() IS NOT NULL
    );
