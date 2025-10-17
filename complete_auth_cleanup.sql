-- COMPLETE AUTH USER CLEANUP
-- This will help you remove users from Supabase Auth completely

-- =====================================================
-- 1. CHECK WHICH USERS NEED AUTH CLEANUP
-- =====================================================

-- Find users that were deleted from userinfo but still exist in auth.users
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created_at,
    'User deleted from userinfo but still in auth.users' as status
FROM auth.users au
LEFT JOIN userinfo u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- =====================================================
-- 2. CREATE FUNCTION TO DELETE AUTH USER BY EMAIL
-- =====================================================

CREATE OR REPLACE FUNCTION delete_auth_user_by_email(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    auth_user_record RECORD;
    deletion_count INTEGER;
BEGIN
    -- Find auth user by email
    SELECT * INTO auth_user_record FROM auth.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Auth user not found',
            'email', user_email
        );
    END IF;

    -- Delete from auth.users
    DELETE FROM auth.users WHERE email = user_email;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;

    RETURN json_build_object(
        'success', true,
        'email', user_email,
        'auth_user_id', auth_user_record.id,
        'deleted_rows', deletion_count,
        'message', 'Auth user deleted successfully'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Failed to delete auth user: ' || SQLERRM,
        'email', user_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CREATE FUNCTION TO DELETE AUTH USER BY ID
-- =====================================================

CREATE OR REPLACE FUNCTION delete_auth_user_by_id(auth_user_id UUID)
RETURNS JSON AS $$
DECLARE
    auth_user_record RECORD;
    deletion_count INTEGER;
BEGIN
    -- Find auth user by ID
    SELECT * INTO auth_user_record FROM auth.users WHERE id = auth_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Auth user not found',
            'auth_user_id', auth_user_id
        );
    END IF;

    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = auth_user_id;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;

    RETURN json_build_object(
        'success', true,
        'auth_user_id', auth_user_id,
        'email', auth_user_record.email,
        'deleted_rows', deletion_count,
        'message', 'Auth user deleted successfully'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Failed to delete auth user: ' || SQLERRM,
        'auth_user_id', auth_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. CREATE FUNCTION TO DELETE ALL ORPHANED AUTH USERS
-- =====================================================

CREATE OR REPLACE FUNCTION delete_orphaned_auth_users()
RETURNS JSON AS $$
DECLARE
    auth_user_record RECORD;
    deleted_count INTEGER := 0;
    failed_count INTEGER := 0;
    deleted_users TEXT[] := '{}';
    failed_users TEXT[] := '{}';
BEGIN
    -- Loop through all auth users that don't exist in userinfo
    FOR auth_user_record IN 
        SELECT au.id, au.email 
        FROM auth.users au
        LEFT JOIN userinfo u ON au.id = u.id
        WHERE u.id IS NULL
    LOOP
        BEGIN
            -- Try to delete the auth user
            DELETE FROM auth.users WHERE id = auth_user_record.id;
            
            -- If successful, add to deleted list
            deleted_count := deleted_count + 1;
            deleted_users := array_append(deleted_users, auth_user_record.email);
            
        EXCEPTION WHEN OTHERS THEN
            -- If failed, add to failed list
            failed_count := failed_count + 1;
            failed_users := array_append(failed_users, auth_user_record.email || ': ' || SQLERRM);
        END;
    END LOOP;

    RETURN json_build_object(
        'success', true,
        'deleted_count', deleted_count,
        'failed_count', failed_count,
        'deleted_users', deleted_users,
        'failed_users', failed_users,
        'message', 'Orphaned auth users cleanup completed'
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION delete_auth_user_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_auth_user_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_orphaned_auth_users() TO authenticated;

-- =====================================================
-- 6. USAGE EXAMPLES
-- =====================================================

-- Delete specific user by email
-- SELECT delete_auth_user_by_email('judahsleibi34@gmail.com');

-- Delete specific user by ID
-- SELECT delete_auth_user_by_id('user-uuid-here');

-- Delete ALL orphaned auth users (users deleted from userinfo but still in auth.users)
-- SELECT delete_orphaned_auth_users();

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check remaining auth users
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Check if any orphaned auth users remain
-- SELECT au.id, au.email FROM auth.users au LEFT JOIN userinfo u ON au.id = u.id WHERE u.id IS NULL;
