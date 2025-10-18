-- MANUAL AUTH USER DELETION
-- Use this to manually delete users from Supabase Auth when automatic deletion fails

-- =====================================================
-- 1. CREATE FUNCTION TO DELETE AUTH USER BY EMAIL
-- =====================================================

CREATE OR REPLACE FUNCTION delete_auth_user_by_email(user_email_to_delete TEXT)
RETURNS JSON AS $$
DECLARE
    auth_user_record RECORD;
    deletion_count INTEGER;
BEGIN
    -- Find auth user by email
    SELECT * INTO auth_user_record FROM auth.users WHERE email = user_email_to_delete;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Auth user not found',
            'email', user_email_to_delete
        );
    END IF;

    -- Delete from auth.users
    DELETE FROM auth.users WHERE email = user_email_to_delete;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;

    RETURN json_build_object(
        'success', true,
        'email', user_email_to_delete,
        'auth_user_id', auth_user_record.id,
        'deleted_rows', deletion_count,
        'message', 'Auth user deleted successfully'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Failed to delete auth user: ' || SQLERRM,
        'email', user_email_to_delete
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. CREATE FUNCTION TO DELETE AUTH USER BY ID
-- =====================================================

CREATE OR REPLACE FUNCTION delete_auth_user_by_id(auth_user_id_to_delete UUID)
RETURNS JSON AS $$
DECLARE
    auth_user_record RECORD;
    deletion_count INTEGER;
BEGIN
    -- Find auth user by ID
    SELECT * INTO auth_user_record FROM auth.users WHERE id = auth_user_id_to_delete;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Auth user not found',
            'auth_user_id', auth_user_id_to_delete
        );
    END IF;

    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = auth_user_id_to_delete;
    GET DIAGNOSTICS deletion_count = ROW_COUNT;

    RETURN json_build_object(
        'success', true,
        'auth_user_id', auth_user_id_to_delete,
        'email', auth_user_record.email,
        'deleted_rows', deletion_count,
        'message', 'Auth user deleted successfully'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Failed to delete auth user: ' || SQLERRM,
        'auth_user_id', auth_user_id_to_delete
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION delete_auth_user_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_auth_user_by_id(UUID) TO authenticated;

-- =====================================================
-- 4. USAGE EXAMPLES
-- =====================================================

-- Delete auth user by email
-- SELECT delete_auth_user_by_email('judahsleibi34@gmail.com');

-- Delete auth user by ID (get ID from userinfo table first)
-- SELECT delete_auth_user_by_id('user-uuid-here');

-- =====================================================
-- 5. CHECK REMAINING AUTH USERS
-- =====================================================

-- See all remaining auth users
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;
