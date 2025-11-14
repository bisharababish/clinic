-- =====================================================
-- Email Verification for Admin-Created Users
-- =====================================================
-- 
-- This script provides SQL queries and instructions for
-- manually verifying users created by admins.
--
-- NOTE: The auth.users table is managed by Supabase and
-- cannot be directly modified via SQL. You must use the
-- Supabase Admin API or the backend endpoint.
--
-- =====================================================

-- =====================================================
-- 1. CHECK VERIFICATION STATUS
-- =====================================================
-- Use this query to check which users are not verified
-- Run this in Supabase SQL Editor with service role permissions

SELECT 
    u.id as auth_user_id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    CASE 
        WHEN u.email_confirmed_at IS NULL THEN 'NOT VERIFIED'
        ELSE 'VERIFIED'
    END as verification_status,
    ui.userid,
    ui.user_roles,
    ui.english_username_a || ' ' || ui.english_username_d as full_name
FROM auth.users u
LEFT JOIN public.userinfo ui ON u.id = ui.id
WHERE u.email_confirmed_at IS NULL
ORDER BY u.created_at DESC;

-- =====================================================
-- 2. CHECK SPECIFIC USER VERIFICATION STATUS
-- =====================================================
-- Replace 'user@example.com' with the actual email

SELECT 
    u.id as auth_user_id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    CASE 
        WHEN u.email_confirmed_at IS NULL THEN 'NOT VERIFIED'
        ELSE 'VERIFIED'
    END as verification_status,
    ui.userid,
    ui.user_roles
FROM auth.users u
LEFT JOIN public.userinfo ui ON u.id = ui.id
WHERE u.email = 'user@example.com';

-- =====================================================
-- 3. COUNT UNVERIFIED USERS
-- =====================================================

SELECT 
    COUNT(*) as unverified_count,
    COUNT(CASE WHEN ui.user_roles IS NOT NULL THEN 1 END) as unverified_with_profile
FROM auth.users u
LEFT JOIN public.userinfo ui ON u.id = ui.id
WHERE u.email_confirmed_at IS NULL;

-- =====================================================
-- 4. MANUAL VERIFICATION METHODS
-- =====================================================
--
-- Since auth.users is a managed table, you cannot directly
-- update email_confirmed_at via SQL. Use one of these methods:
--
-- METHOD 1: Use the Backend API Endpoint (Recommended)
-- ----------------------------------------
-- The backend endpoint /api/admin/confirm-email is already
-- set up. You can call it programmatically or use a tool
-- like Postman/curl:
--
-- POST https://api.bethlehemmedcenter.com/api/admin/confirm-email
-- Headers:
--   Authorization: Bearer <admin_access_token>
--   X-CSRF-Token: <csrf_token>
--   Content-Type: application/json
-- Body:
--   {
--     "userEmail": "user@example.com"
--   }
--
-- METHOD 2: Use Supabase Dashboard
-- ----------------------------------------
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Users
-- 3. Find the user by email
-- 4. Click on the user
-- 5. Click "Confirm Email" button
--
-- METHOD 3: Use Supabase Admin API Directly
-- ----------------------------------------
-- You can use the Supabase Admin API from your backend or
-- a script with the service role key:
--
-- const { createClient } = require('@supabase/supabase-js');
-- const supabaseAdmin = createClient(
--   process.env.SUPABASE_URL,
--   process.env.SUPABASE_SERVICE_ROLE_KEY
-- );
--
-- // Find user by email
-- const { data: users } = await supabaseAdmin.auth.admin.listUsers();
-- const user = users.users.find(u => u.email === 'user@example.com');
--
-- // Confirm email
-- await supabaseAdmin.auth.admin.updateUserById(user.id, {
--   email_confirm: true
-- });
--
-- METHOD 4: Bulk Verification via Backend Script
-- ----------------------------------------
-- Create a script that:
-- 1. Queries all unverified users
-- 2. Calls the confirm-email endpoint for each
--
-- =====================================================
-- 5. VERIFY ALL ADMIN-CREATED USERS (Bulk Operation)
-- =====================================================
-- This query helps identify users that need verification
-- Run this to get a list, then verify them using Method 1 or 2

SELECT 
    u.id as auth_user_id,
    u.email,
    ui.user_roles,
    ui.english_username_a || ' ' || COALESCE(ui.english_username_d, '') as full_name,
    u.created_at as user_created_at
FROM auth.users u
INNER JOIN public.userinfo ui ON u.id = ui.id
WHERE u.email_confirmed_at IS NULL
    AND ui.user_roles IN ('Admin', 'Doctor', 'Patient', 'Secretary', 'Nurse', 'Lab', 'X Ray', 'Ultrasound', 'Audiometry')
ORDER BY u.created_at DESC;

-- =====================================================
-- 6. CREATE A DATABASE FUNCTION TO CHECK STATUS
-- =====================================================
-- This function can be called to check verification status
-- Note: This only checks status, it cannot modify auth.users

CREATE OR REPLACE FUNCTION check_user_verification_status(user_email TEXT)
RETURNS TABLE (
    auth_user_id UUID,
    email TEXT,
    is_verified BOOLEAN,
    email_confirmed_at TIMESTAMPTZ,
    userid BIGINT,
    user_roles TEXT,
    full_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id::UUID as auth_user_id,
        u.email::TEXT,
        (u.email_confirmed_at IS NOT NULL)::BOOLEAN as is_verified,
        u.email_confirmed_at,
        ui.userid,
        ui.user_roles::TEXT,
        (ui.english_username_a || ' ' || COALESCE(ui.english_username_d, ''))::TEXT as full_name
    FROM auth.users u
    LEFT JOIN public.userinfo ui ON u.id = ui.id
    WHERE u.email = user_email;
END;
$$;

-- Usage:
-- SELECT * FROM check_user_verification_status('user@example.com');

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. The code fix in the frontend should automatically
--    verify users when admins create them.
--
-- 2. If verification fails, use Method 1 (Backend API)
--    or Method 2 (Supabase Dashboard) to verify manually.
--
-- 3. The backend endpoint uses Supabase Admin API with
--    service role key, which has permissions to modify
--    auth.users table.
--
-- 4. Always verify users after creation to ensure they
--    can log in immediately without email confirmation.
--
-- =====================================================

