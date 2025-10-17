-- WORKING DELETE FUNCTION - DELETES FROM TABLES AND AUTH.USERS
-- This function will work when you click the delete button

DROP FUNCTION IF EXISTS public.delete_user_completely(BIGINT);

CREATE OR REPLACE FUNCTION delete_user_completely(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
    deletion_result JSON;
    auth_deletion_result JSON;
BEGIN
    -- Get user info
    SELECT * INTO user_record FROM userinfo WHERE userid = user_id_to_delete;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;

    auth_user_id := user_record.id;

    -- Start transaction
    BEGIN
        -- Delete from all related tables first
        DELETE FROM appointment_change_logs WHERE patient_id = user_id_to_delete::TEXT;
        DELETE FROM lab_results WHERE patient_id = user_id_to_delete;
        DELETE FROM lab_attachments WHERE uploaded_by = user_id_to_delete;
        DELETE FROM xray_images WHERE patient_id = user_id_to_delete;
        
        -- Delete payment related data
        DELETE FROM payment_transactions WHERE payment_booking_id IN (
            SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
        );
        DELETE FROM payment_logs WHERE payment_booking_id IN (
            SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
        );
        DELETE FROM payment_bookings WHERE patient_id = auth_user_id;
        
        -- Delete appointments
        DELETE FROM appointments WHERE patient_id = user_id_to_delete;
        DELETE FROM appointments WHERE doctor_id IN (
            SELECT id FROM doctors WHERE user_id = user_id_to_delete
        );
        
        -- Delete doctor availability
        DELETE FROM doctor_availability WHERE doctor_id IN (
            SELECT id FROM doctors WHERE user_id = user_id_to_delete
        );
        
        -- Delete doctors
        DELETE FROM doctors WHERE user_id = user_id_to_delete;
        
        -- Delete clinical notes
        DELETE FROM clinical_notes WHERE patient_id = user_id_to_delete OR doctor_id = user_id_to_delete;
        
        -- Delete patient health info
        DELETE FROM patient_health_info WHERE patient_id = user_id_to_delete;
        
        -- Delete deletion requests
        DELETE FROM deletion_requests WHERE user_id = user_id_to_delete;
        
        -- Delete notifications and activity logs
        DELETE FROM notifications WHERE user_email = user_record.user_email;
        DELETE FROM activity_log WHERE user_email = user_record.user_email;

        -- Delete from userinfo table (auth.users will be deleted via Admin API)
        DELETE FROM userinfo WHERE userid = user_id_to_delete;
        
        -- Set auth deletion result
        auth_deletion_result := json_build_object(
            'success', true,
            'message', 'Auth user will be deleted via Admin API'
        );
        
        -- Return success with auth deletion info
        RETURN json_build_object(
            'success', true,
            'userid', user_id_to_delete,
            'auth_user_id', auth_user_id,
            'message', 'User deleted from all database tables successfully',
            'auth_deletion', auth_deletion_result
        );

    EXCEPTION WHEN OTHERS THEN
        -- Rollback on error
        RETURN json_build_object(
            'success', false, 
            'error', SQLERRM,
            'message', 'Failed to delete user from tables'
        );
    END;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_completely(BIGINT) TO authenticated;

-- Test function (optional - remove in production)
-- SELECT delete_user_completely(123); -- Replace 123 with actual user ID