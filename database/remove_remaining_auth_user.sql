-- REMOVE REMAINING AUTH USER
-- This will remove the user from Supabase Auth that was deleted from your tables

-- =====================================================
-- 1. CHECK IF USER EXISTS IN AUTH.USERS
-- =====================================================

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'bishara.babish23@gmail.com';

-- =====================================================
-- 2. CHECK IF USER EXISTS IN USERINFO TABLE
-- =====================================================

SELECT 
    userid,
    user_email,
    user_roles,
    id as auth_user_id
FROM userinfo 
WHERE user_email = 'bishara.babish23@gmail.com';

-- =====================================================
-- 3. DELETE FROM AUTH.USERS
-- =====================================================

-- Direct deletion from auth.users
DELETE FROM auth.users WHERE email = 'bishara.babish23@gmail.com';

-- Check if deletion worked
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'bishara.babish23@gmail.com') 
        THEN 'User still exists - deletion failed'
        ELSE 'User successfully deleted from auth.users'
    END as deletion_status;

-- =====================================================
-- 4. VERIFY ALL REMAINING AUTH USERS
-- =====================================================

-- Show all remaining auth users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;

-- =====================================================
-- 5. CHECK FOR ANY OTHER ORPHANED AUTH USERS
-- =====================================================

-- Find any auth users that don't exist in userinfo table
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created_at,
    'Orphaned - exists in auth.users but not in userinfo' as status
FROM auth.users au
LEFT JOIN userinfo u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;
