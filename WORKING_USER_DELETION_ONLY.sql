-- WORKING USER DELETION FUNCTION ONLY
-- This ONLY creates the function - no automatic cleanup
-- Deletion happens ONLY when you click delete button on website

-- =====================================================
-- 1. DROP ALL OLD FUNCTIONS FIRST
-- =====================================================

DROP FUNCTION IF EXISTS public.delete_user_completely(BIGINT);
DROP FUNCTION IF EXISTS public.delete_user_with_auto_auth_cleanup(BIGINT);
DROP FUNCTION IF EXISTS public.cleanup_orphaned_auth_users();

-- =====================================================
-- 2. CREATE USER DELETION FUNCTION ONLY
-- =====================================================

CREATE OR REPLACE FUNCTION delete_user_completely(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
    deletion_results JSON := '{}';
    result_count INTEGER := 0;
    auth_deletion_success BOOLEAN := false;
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

    -- Start transaction for atomic deletion
    BEGIN
        -- 1. Delete appointment change logs (patient_id is TEXT in this table)
        DELETE FROM appointment_change_logs WHERE patient_id = user_id_to_delete::TEXT;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('appointment_change_logs', result_count);

        -- 2. Delete lab results
        DELETE FROM lab_results WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('lab_results', result_count);

        -- 3. Delete lab attachments (uploaded_by references userinfo.userid)
        DELETE FROM lab_attachments WHERE uploaded_by = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('lab_attachments', result_count);

        -- 4. Delete X-ray images
        DELETE FROM xray_images WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('xray_images', result_count);

        -- 5. Delete payment transactions (through payment_bookings)
        DELETE FROM payment_transactions 
        WHERE payment_booking_id IN (
            SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
        );
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('payment_transactions', result_count);

        -- 6. Delete payment logs (through payment_bookings)
        DELETE FROM payment_logs 
        WHERE payment_booking_id IN (
            SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
        );
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('payment_logs', result_count);

        -- 7. Delete payment bookings (patient_id is UUID, references auth.users.id)
        DELETE FROM payment_bookings WHERE patient_id = auth_user_id;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('payment_bookings', result_count);

        -- 8. Delete appointments as patient (patient_id is BIGINT, references userinfo.userid)
        DELETE FROM appointments WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('appointments_as_patient', result_count);

        -- 9. Delete appointments as doctor (doctor_id is UUID, references doctors.id)
        DELETE FROM appointments WHERE doctor_id IN (
            SELECT id FROM doctors WHERE user_id = user_id_to_delete
        );
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('appointments_as_doctor', result_count);

        -- 10. Delete doctor availability (doctor_id is UUID, references doctors.id)
        DELETE FROM doctor_availability WHERE doctor_id IN (
            SELECT id FROM doctors WHERE user_id = user_id_to_delete
        );
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('doctor_availability', result_count);

        -- 11. Delete doctors record (user_id is INTEGER, references userinfo.userid)
        DELETE FROM doctors WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('doctors', result_count);

        -- 12. Delete clinical notes (patient_id and doctor_id are BIGINT, references userinfo.userid)
        DELETE FROM clinical_notes WHERE patient_id = user_id_to_delete OR doctor_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('clinical_notes', result_count);

        -- 13. Delete patient health info
        DELETE FROM patient_health_info WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('patient_health_info', result_count);

        -- 14. Delete deletion requests
        DELETE FROM deletion_requests WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('deletion_requests', result_count);

        -- 15. Delete notifications (by email since no user_id foreign key)
        DELETE FROM notifications WHERE user_email = user_record.user_email;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('notifications', result_count);

        -- 16. Delete activity logs (by email since no user_id foreign key)
        DELETE FROM activity_log WHERE user_email = user_record.user_email;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('activity_log', result_count);

        -- 17. DELETE AUTH USER FIRST (to prevent cascade issues)
        BEGIN
            DELETE FROM auth.users WHERE id = auth_user_id;
            auth_deletion_success := true;
            deletion_results := deletion_results || json_build_object('auth_users', 1);
        EXCEPTION WHEN OTHERS THEN
            -- Auth deletion failed, but continue
            auth_deletion_success := false;
            deletion_results := deletion_results || json_build_object('auth_users', 0);
            deletion_results := deletion_results || json_build_object('auth_error', SQLERRM);
        END;

        -- 18. Delete userinfo record LAST (after auth user is gone to prevent cascade)
        DELETE FROM userinfo WHERE userid = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('userinfo', result_count);

        -- Return success with detailed results
        RETURN json_build_object(
            'success', true,
            'userid', user_id_to_delete,
            'auth_deletion_success', auth_deletion_success,
            'deletion_results', deletion_results
        );

    EXCEPTION WHEN OTHERS THEN
        -- Transaction failed, rollback and return error
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'userid', user_id_to_delete
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
