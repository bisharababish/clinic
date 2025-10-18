-- SIMPLE DELETE TEST
-- Let's create a simple test function to see what's happening

CREATE OR REPLACE FUNCTION test_delete_user(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
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

    RETURN json_build_object(
        'success', true,
        'userid', user_id_to_delete,
        'user_email', user_record.user_email,
        'auth_user_id', auth_user_id,
        'message', 'User found, ready for deletion'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test with a user ID (replace with actual user ID you want to test)
-- SELECT test_delete_user(1746219539694);
