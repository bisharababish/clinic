-- FORCE AUTH DELETE - TRIES DIFFERENT METHODS TO DELETE FROM AUTH.USERS
-- This will delete from tables AND force delete from auth.users

DROP FUNCTION IF EXISTS public.delete_user_completely(BIGINT);

CREATE OR REPLACE FUNCTION delete_user_completely(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
    auth_deleted BOOLEAN := false;
BEGIN
    -- Get user info
    SELECT * INTO user_record FROM userinfo WHERE userid = user_id_to_delete;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;

    auth_user_id := user_record.id;

    -- Delete from all tables
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

    -- TRY DIFFERENT METHODS TO DELETE FROM AUTH.USERS
    BEGIN
        -- Method 1: Direct delete
        DELETE FROM auth.users WHERE id = auth_user_id;
        auth_deleted := true;
    EXCEPTION WHEN OTHERS THEN
        -- Method 2: Try with explicit schema
        BEGIN
            DELETE FROM auth.users WHERE id = auth_user_id;
            auth_deleted := true;
        EXCEPTION WHEN OTHERS THEN
            -- Method 3: Try with dynamic SQL
            BEGIN
                EXECUTE format('DELETE FROM auth.users WHERE id = %L', auth_user_id);
                auth_deleted := true;
            EXCEPTION WHEN OTHERS THEN
                auth_deleted := false;
            END;
        END;
    END;

    -- Delete from userinfo
    DELETE FROM userinfo WHERE userid = user_id_to_delete;
    
    RETURN json_build_object(
        'success', true,
        'userid', user_id_to_delete,
        'auth_deleted', auth_deleted,
        'auth_user_id', auth_user_id,
        'message', CASE 
            WHEN auth_deleted THEN 'User deleted from tables and auth.users'
            ELSE 'User deleted from tables, auth deletion failed'
        END
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
