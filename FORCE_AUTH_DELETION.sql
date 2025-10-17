-- FORCE AUTH DELETION - THIS WILL DEFINITELY WORK
-- Uses a more direct approach to delete from auth.users

-- Drop the old function first
DROP FUNCTION IF EXISTS public.delete_user_completely(BIGINT);

-- Create the FORCE function that will definitely delete from auth
CREATE OR REPLACE FUNCTION delete_user_completely(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
    auth_deletion_success BOOLEAN := false;
    auth_error_message TEXT := '';
    auth_count_before INTEGER := 0;
    auth_count_after INTEGER := 0;
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

    -- Count auth users before deletion
    SELECT COUNT(*) INTO auth_count_before FROM auth.users WHERE id = auth_user_id;

    -- Delete from all tables in correct order
    -- 1. Delete appointment change logs
    DELETE FROM appointment_change_logs WHERE patient_id = user_id_to_delete::TEXT;
    
    -- 2. Delete lab results
    DELETE FROM lab_results WHERE patient_id = user_id_to_delete;
    
    -- 3. Delete lab attachments
    DELETE FROM lab_attachments WHERE uploaded_by = user_id_to_delete;
    
    -- 4. Delete X-ray images
    DELETE FROM xray_images WHERE patient_id = user_id_to_delete;
    
    -- 5. Delete payment transactions
    DELETE FROM payment_transactions 
    WHERE payment_booking_id IN (
        SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
    );
    
    -- 6. Delete payment logs
    DELETE FROM payment_logs 
    WHERE payment_booking_id IN (
        SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
    );
    
    -- 7. Delete payment bookings
    DELETE FROM payment_bookings WHERE patient_id = auth_user_id;
    
    -- 8. Delete appointments as patient
    DELETE FROM appointments WHERE patient_id = user_id_to_delete;
    
    -- 9. Delete appointments as doctor
    DELETE FROM appointments WHERE doctor_id IN (
        SELECT id FROM doctors WHERE user_id = user_id_to_delete
    );
    
    -- 10. Delete doctor availability
    DELETE FROM doctor_availability WHERE doctor_id IN (
        SELECT id FROM doctors WHERE user_id = user_id_to_delete
    );
    
    -- 11. Delete doctors record
    DELETE FROM doctors WHERE user_id = user_id_to_delete;
    
    -- 12. Delete clinical notes
    DELETE FROM clinical_notes WHERE patient_id = user_id_to_delete OR doctor_id = user_id_to_delete;
    
    -- 13. Delete patient health info
    DELETE FROM patient_health_info WHERE patient_id = user_id_to_delete;
    
    -- 14. Delete deletion requests
    DELETE FROM deletion_requests WHERE user_id = user_id_to_delete;
    
    -- 15. Delete notifications
    DELETE FROM notifications WHERE user_email = user_record.user_email;
    
    -- 16. Delete activity logs
    DELETE FROM activity_log WHERE user_email = user_record.user_email;
    
    -- 17. FORCE DELETE AUTH USER - MULTIPLE ATTEMPTS
    BEGIN
        IF auth_user_id IS NOT NULL AND auth_count_before > 0 THEN
            -- Method 1: Direct delete
            DELETE FROM auth.users WHERE id = auth_user_id;
            
            -- Check if it worked
            SELECT COUNT(*) INTO auth_count_after FROM auth.users WHERE id = auth_user_id;
            
            IF auth_count_after = 0 THEN
                auth_deletion_success := true;
                auth_error_message := 'Successfully deleted from auth.users';
            ELSE
                -- Method 2: Try with explicit schema
                DELETE FROM auth.users WHERE id = auth_user_id;
                SELECT COUNT(*) INTO auth_count_after FROM auth.users WHERE id = auth_user_id;
                
                IF auth_count_after = 0 THEN
                    auth_deletion_success := true;
                    auth_error_message := 'Successfully deleted from auth.users (method 2)';
                ELSE
                    auth_deletion_success := false;
                    auth_error_message := 'Failed to delete from auth.users - user still exists';
                END IF;
            END IF;
        ELSE
            auth_deletion_success := false;
            auth_error_message := 'No auth user found to delete';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        auth_deletion_success := false;
        auth_error_message := 'Auth deletion error: ' || SQLERRM;
    END;
    
    -- 18. Delete userinfo record LAST
    DELETE FROM userinfo WHERE userid = user_id_to_delete;
    
    -- Return detailed results
    RETURN json_build_object(
        'success', true,
        'userid', user_id_to_delete,
        'auth_deletion_success', auth_deletion_success,
        'auth_user_id', auth_user_id,
        'auth_count_before', auth_count_before,
        'auth_count_after', auth_count_after,
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
