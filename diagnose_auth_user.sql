-- DIAGNOSE AUTH USER DELETION ISSUE
-- This will help us understand why the deletion failed

-- =====================================================
-- 1. CHECK IF THE USER EXISTS IN AUTH.USERS
-- =====================================================

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    phone,
    confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
FROM auth.users 
WHERE email = 'bishara.babish36@gmail.com';

-- =====================================================
-- 2. CHECK IF USER EXISTS IN USERINFO TABLE
-- =====================================================

SELECT 
    userid,
    user_email,
    id as auth_user_id,
    user_roles,
    created_at
FROM userinfo 
WHERE user_email = 'bishara.babish36@gmail.com';

-- =====================================================
-- 3. CHECK FOR FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Check if this user is referenced in other tables
SELECT 'payment_bookings' as table_name, COUNT(*) as references
FROM payment_bookings 
WHERE patient_id = (SELECT id FROM auth.users WHERE email = 'bishara.babish36@gmail.com')

UNION ALL

SELECT 'appointments' as table_name, COUNT(*) as references
FROM appointments 
WHERE doctor_id = (SELECT id FROM auth.users WHERE email = 'bishara.babish36@gmail.com')

UNION ALL

SELECT 'doctor_availability' as table_name, COUNT(*) as references
FROM doctor_availability 
WHERE doctor_id = (SELECT id FROM auth.users WHERE email = 'bishara.babish36@gmail.com')

UNION ALL

SELECT 'doctors' as table_name, COUNT(*) as references
FROM doctors 
WHERE id = (SELECT id FROM auth.users WHERE email = 'bishara.babish36@gmail.com');

-- =====================================================
-- 4. CREATE ENHANCED DELETION FUNCTION WITH DETAILED ERROR INFO
-- =====================================================

CREATE OR REPLACE FUNCTION delete_auth_user_with_details(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    auth_user_record RECORD;
    auth_user_id UUID;
    deletion_count INTEGER;
    error_details TEXT;
BEGIN
    -- Find auth user by email
    SELECT * INTO auth_user_record FROM auth.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Auth user not found',
            'email', user_email,
            'details', 'No user with this email exists in auth.users'
        );
    END IF;

    auth_user_id := auth_user_record.id;

    -- Try to delete from auth.users
    BEGIN
        DELETE FROM auth.users WHERE email = user_email;
        GET DIAGNOSTICS deletion_count = ROW_COUNT;

        RETURN json_build_object(
            'success', true,
            'email', user_email,
            'auth_user_id', auth_user_id,
            'deleted_rows', deletion_count,
            'message', 'Auth user deleted successfully'
        );

    EXCEPTION WHEN OTHERS THEN
        error_details := 'Error: ' || SQLSTATE || ' - ' || SQLERRM;
        
        RETURN json_build_object(
            'success', false,
            'error', 'Failed to delete auth user',
            'email', user_email,
            'auth_user_id', auth_user_id,
            'details', error_details,
            'sqlstate', SQLSTATE,
            'sql_message', SQLERRM
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION delete_auth_user_with_details(TEXT) TO authenticated;

-- =====================================================
-- 5. TEST THE ENHANCED DELETION FUNCTION
-- =====================================================

-- This will give us detailed error information
SELECT delete_auth_user_with_details('bishara.babish36@gmail.com');
