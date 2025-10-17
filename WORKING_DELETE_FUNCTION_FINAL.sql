-- WORKING DELETE FUNCTION - FINAL VERSION
-- This will delete user from database tables
-- Run this in your Supabase SQL Editor

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.delete_user_completely(BIGINT);

-- Create the working function
CREATE OR REPLACE FUNCTION delete_user_completely(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
    deleted_count INTEGER := 0;
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

    -- Get auth user ID (may be NULL)
    auth_user_id := user_record.id;

    -- Delete from all related tables (in correct order to avoid foreign key issues)
    
    -- 1. Delete appointment change logs
    DELETE FROM appointment_change_logs WHERE patient_id = user_id_to_delete::TEXT;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- 2. Delete lab attachments first (foreign key to lab_results)
    DELETE FROM lab_attachments WHERE uploaded_by = user_id_to_delete;
    
    -- 3. Delete lab results
    DELETE FROM lab_results WHERE patient_id = user_id_to_delete;
    
    -- 4. Delete xray images
    DELETE FROM xray_images WHERE patient_id = user_id_to_delete;
    
    -- 5. Delete payment transactions (foreign key to payment_bookings)
    DELETE FROM payment_transactions WHERE payment_booking_id IN (
        SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
    );
    
    -- 6. Delete payment logs (foreign key to payment_bookings)
    DELETE FROM payment_logs WHERE payment_booking_id IN (
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
    
    -- 11. Delete doctors table
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
    
    -- 17. Finally delete from userinfo
    DELETE FROM userinfo WHERE userid = user_id_to_delete;

    -- Return success result
    RETURN json_build_object(
        'success', true,
        'message', 'User completely deleted from database tables',
        'userid', user_id_to_delete,
        'user_email', user_record.user_email,
        'auth_user_id', auth_user_id,
        'tables_deleted', true
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database deletion failed: ' || SQLERRM,
            'userid', user_id_to_delete
        );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.delete_user_completely(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_completely(BIGINT) TO anon;
