-- DEBUG: Check why auth user deletion is failing
-- Run this to see what's happening with auth user deletion

-- =====================================================
-- 1. CHECK IF USER HAS AUTH ACCOUNT
-- =====================================================

-- Check if Judah Sleibi has an auth account
SELECT 
    u.userid,
    u.user_email,
    u.id as auth_user_id,
    au.id as auth_exists,
    au.email as auth_email
FROM userinfo u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.userid = 406303941;

-- =====================================================
-- 2. CHECK ALL USERS AND THEIR AUTH STATUS
-- =====================================================

-- See all users and whether they have auth accounts
SELECT 
    u.userid,
    u.user_email,
    u.id as auth_user_id,
    CASE 
        WHEN au.id IS NOT NULL THEN 'Has Auth Account'
        ELSE 'No Auth Account'
    END as auth_status,
    au.email as auth_email
FROM userinfo u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.userid;

-- =====================================================
-- 3. CREATE IMPROVED DELETION FUNCTION WITH BETTER AUTH HANDLING
-- =====================================================

CREATE OR REPLACE FUNCTION delete_user_with_auth_debug(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
    auth_deletion_result TEXT;
    deletion_results JSON;
BEGIN
    -- Get user information first
    SELECT * INTO user_record FROM userinfo WHERE userid = user_id_to_delete;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found',
            'userid', user_id_to_delete
        );
    END IF;

    -- Get auth user ID
    auth_user_id := user_record.id;

    -- Check if auth user exists
    IF auth_user_id IS NULL THEN
        auth_deletion_result := 'No auth user ID found in userinfo';
    ELSE
        -- Try to delete from auth.users
        BEGIN
            DELETE FROM auth.users WHERE id = auth_user_id;
            GET DIAGNOSTICS auth_deletion_result = ROW_COUNT;
            auth_deletion_result := 'Auth user deleted successfully - ' || auth_deletion_result || ' rows';
        EXCEPTION WHEN OTHERS THEN
            auth_deletion_result := 'Auth deletion failed: ' || SQLERRM;
        END;
    END IF;

    -- Delete from userinfo table
    DELETE FROM userinfo WHERE userid = user_id_to_delete;

    RETURN json_build_object(
        'success', true,
        'userid', user_id_to_delete,
        'user_email', user_record.user_email,
        'auth_user_id', auth_user_id,
        'auth_deletion_result', auth_deletion_result,
        'message', 'User deleted with auth debug info'
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION delete_user_with_auth_debug(BIGINT) TO authenticated;

-- =====================================================
-- 4. TEST THE DEBUG FUNCTION
-- =====================================================

-- Test with a user (replace with actual userid)
-- SELECT delete_user_with_auth_debug(406303941);
