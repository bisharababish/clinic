-- DEBUG DELETE FUNCTION
-- Test the function to see what's wrong

-- First, let's see if the function exists
SELECT 
    routine_name, 
    routine_type, 
    data_type
FROM information_schema.routines 
WHERE routine_name = 'delete_user_completely' 
AND routine_schema = 'public';

-- Test the function with a sample user ID (replace with actual user ID)
-- SELECT delete_user_completely(1746219539694);

-- Check what users exist in userinfo
SELECT userid, user_email, english_username_a, user_roles 
FROM userinfo 
ORDER BY userid DESC 
LIMIT 5;

-- Check what users exist in auth.users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
