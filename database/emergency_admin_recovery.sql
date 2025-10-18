-- EMERGENCY ADMIN ACCOUNT RECOVERY
-- This will help restore your admin access

-- =====================================================
-- 1. CHECK IF ADMIN USER EXISTS IN USERINFO
-- =====================================================

SELECT 
    userid,
    user_email,
    user_roles,
    english_username_a,
    english_username_d,
    id as auth_user_id,
    created_at
FROM userinfo 
WHERE user_email = 'bishara@gmail.com' 
   OR user_roles ILIKE '%admin%'
ORDER BY userid;

-- =====================================================
-- 2. CHECK IF ADMIN EXISTS IN AUTH.USERS
-- =====================================================

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'bishara@gmail.com';

-- =====================================================
-- 3. CREATE EMERGENCY ADMIN USER
-- =====================================================

-- Create admin user in userinfo table
INSERT INTO userinfo (
    user_roles,
    english_username_a,
    english_username_b,
    english_username_c,
    english_username_d,
    arabic_username_a,
    arabic_username_b,
    arabic_username_c,
    arabic_username_d,
    user_email,
    user_phonenumber,
    date_of_birth,
    gender_user,
    user_password,
    created_at,
    updated_at
) VALUES (
    'Admin',
    'Admin',
    'Admin',
    'Admin',
    'Admin',
    'مدير',
    'مدير',
    'مدير',
    'مدير',
    'bishara@gmail.com',
    '1234567890',
    '1990-01-01',
    'male',
    'admin123', -- Change this password
    NOW(),
    NOW()
) ON CONFLICT (user_email) DO UPDATE SET
    user_roles = 'Admin',
    updated_at = NOW()
RETURNING userid, user_email, user_roles;

-- =====================================================
-- 4. CHECK ALL EXISTING USERS
-- =====================================================

SELECT 
    userid,
    user_email,
    user_roles,
    english_username_a,
    created_at
FROM userinfo 
ORDER BY userid DESC
LIMIT 10;

-- =====================================================
-- 5. CREATE AUTH USER (if needed)
-- =====================================================

-- Note: You'll need to create the auth user through Supabase Dashboard
-- Go to Authentication → Users → Add User
-- Email: bishara@gmail.com
-- Password: admin123 (or whatever you prefer)
-- Auto Confirm User: Yes
