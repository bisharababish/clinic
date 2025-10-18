-- MANUAL AUTH CLEANUP - RUN THIS AFTER DELETING USERS FROM WEBSITE
-- This will clean up any auth users that don't have corresponding userinfo records

-- Step 1: See which auth users are orphaned (exist in auth.users but not in userinfo)
SELECT 
    au.id,
    au.email,
    au.created_at,
    'ORPHANED - No userinfo record' as status
FROM auth.users au 
LEFT JOIN userinfo ui ON au.id = ui.id 
WHERE ui.id IS NULL
ORDER BY au.created_at DESC;

-- Step 2: Delete orphaned auth users (run this to actually delete them)
-- Uncomment the line below to actually delete the orphaned users
-- DELETE FROM auth.users WHERE id IN (
--     SELECT au.id
--     FROM auth.users au 
--     LEFT JOIN userinfo ui ON au.id = ui.id 
--     WHERE ui.id IS NULL
-- );

-- Step 3: Check remaining auth users
SELECT COUNT(*) as remaining_auth_users FROM auth.users;
