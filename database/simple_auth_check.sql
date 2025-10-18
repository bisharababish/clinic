-- SIMPLE AUTH USER CHECK AND MANUAL DELETION
-- This will help us see what's happening and delete the user manually

-- =====================================================
-- 1. CHECK IF USER EXISTS IN AUTH.USERS
-- =====================================================

SELECT 
    'auth.users' as table_name,
    id,
    email,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Email Confirmed'
        ELSE 'Email Not Confirmed'
    END as email_status
FROM auth.users 
WHERE email = 'bishara.babish36@gmail.com';

-- =====================================================
-- 2. CHECK IF USER EXISTS IN USERINFO TABLE
-- =====================================================

SELECT 
    'userinfo' as table_name,
    userid,
    user_email,
    id as auth_user_id,
    user_roles,
    created_at
FROM userinfo 
WHERE user_email = 'bishara.babish36@gmail.com';

-- =====================================================
-- 3. CHECK ALL USERS IN AUTH.USERS (to see what emails exist)
-- =====================================================

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 4. DIRECT DELETE ATTEMPT (if user exists)
-- =====================================================

-- Try direct deletion
DELETE FROM auth.users WHERE email = 'bishara.babish36@gmail.com';

-- Check if deletion worked
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'bishara.babish36@gmail.com') 
        THEN 'User still exists - deletion failed'
        ELSE 'User successfully deleted'
    END as deletion_status;
