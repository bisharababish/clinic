-- FINAL WORKING DELETE - DIFFERENT APPROACH FOR AUTH DELETION
-- This uses a different method to delete from auth.users

-- Drop the old function first
DROP FUNCTION IF EXISTS public.delete_user_completely(BIGINT);

-- Create the FINAL function with different auth deletion approach
CREATE OR REPLACE FUNCTION delete_user_completely(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
    auth_deletion_success BOOLEAN := false;
    auth_error_message TEXT := '';
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

    -- Delete from all tables first
    DELETE FROM appointment_change_logs WHERE patient_id = user_id_to_delete::TEXT;
    DELETE FROM lab_results WHERE patient_id = user_id_to_delete;
    DELETE FROM lab_attachments WHERE uploaded_by = user_id_to_delete;
    DELETE FROM xray_images WHERE patient_id = user_id_to_delete;
    DELETE FROM payment_transactions WHERE payment_booking_id IN (
        SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
    );
    DELETE FROM payment_logs WHERE payment_booking_id IN (
        SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
    );
    DELETE FROM payment_bookings WHERE patient_id = auth_user_id;
    DELETE FROM appointments WHERE patient_id = user_id_to_delete;
    DELETE FROM appointments WHERE doctor_id IN (
        SELECT id FROM doctors WHERE user_id = user_id_to_delete
    );
    DELETE FROM doctor_availability WHERE doctor_id IN (
        SELECT id FROM doctors WHERE user_id = user_id_to_delete
    );
    DELETE FROM doctors WHERE user_id = user_id_to_delete;
    DELETE FROM clinical_notes WHERE patient_id = user_id_to_delete OR doctor_id = user_id_to_delete;
    DELETE FROM patient_health_info WHERE patient_id = user_id_to_delete;
    DELETE FROM deletion_requests WHERE user_id = user_id_to_delete;
    DELETE FROM notifications WHERE user_email = user_record.user_email;
    DELETE FROM activity_log WHERE user_email = user_record.user_email;

    -- Try different approaches to delete from auth.users
    BEGIN
        -- Method 1: Direct delete with explicit casting
        DELETE FROM auth.users WHERE id::text = auth_user_id::text;
        
        -- Check if it worked
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = auth_user_id) THEN
            auth_deletion_success := true;
            auth_error_message := 'Successfully deleted from auth.users (method 1)';
        ELSE
            -- Method 2: Try with different approach
            DELETE FROM auth.users WHERE id = auth_user_id;
            
            IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = auth_user_id) THEN
                auth_deletion_success := true;
                auth_error_message := 'Successfully deleted from auth.users (method 2)';
            ELSE
                -- Method 3: Try using auth schema explicitly
                EXECUTE format('DELETE FROM auth.users WHERE id = %L', auth_user_id);
                
                IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = auth_user_id) THEN
                    auth_deletion_success := true;
                    auth_error_message := 'Successfully deleted from auth.users (method 3)';
                ELSE
                    auth_deletion_success := false;
                    auth_error_message := 'All auth deletion methods failed - user still exists';
                END IF;
            END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        auth_deletion_success := false;
        auth_error_message := 'Auth deletion error: ' || SQLERRM;
    END;

    -- Delete userinfo record last
    DELETE FROM userinfo WHERE userid = user_id_to_delete;
    
    -- Return detailed results
    RETURN json_build_object(
        'success', true,
        'userid', user_id_to_delete,
        'auth_deletion_success', auth_deletion_success,
        'auth_user_id', auth_user_id,
        'auth_error', auth_error_message,
        'message', CASE 
            WHEN auth_deletion_success THEN 'User completely deleted from database and auth'
            ELSE 'User deleted from database, auth deletion failed: ' || auth_error_message
        END
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'userid', user_id_to_delete
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
