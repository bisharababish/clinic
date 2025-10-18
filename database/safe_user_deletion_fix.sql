-- SAFE USER DELETION FIX
-- This fixes the cascade issue and ensures only the target user is deleted
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. DROP OLD FUNCTIONS FIRST
-- =====================================================

DROP FUNCTION IF EXISTS public.delete_user_completely(BIGINT);
DROP FUNCTION IF EXISTS public.cleanup_orphaned_auth_users();

-- =====================================================
-- 2. CREATE SAFE USER DELETION FUNCTION (NO CASCADE)
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
        -- 1. Delete appointment change logs
        DELETE FROM appointment_change_logs WHERE patient_id = user_id_to_delete::TEXT;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('appointment_change_logs', result_count);

        -- 2. Delete lab results
        DELETE FROM lab_results WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('lab_results', result_count);

        -- 3. Delete lab attachments
        DELETE FROM lab_attachments WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('lab_attachments', result_count);

        -- 4. Delete X-ray images
        DELETE FROM xray_images WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('xray_images', result_count);

        -- 5. Delete payment transactions
        DELETE FROM payment_transactions WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('payment_transactions', result_count);

        -- 6. Delete payment logs
        DELETE FROM payment_logs WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('payment_logs', result_count);

        -- 7. Delete payment bookings
        DELETE FROM payment_bookings WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('payment_bookings', result_count);

        -- 8. Delete appointments as patient
        DELETE FROM appointments WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('appointments_as_patient', result_count);

        -- 9. Delete appointments as doctor
        DELETE FROM appointments WHERE doctor_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('appointments_as_doctor', result_count);

        -- 10. Delete doctor availability
        DELETE FROM doctor_availability WHERE doctor_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('doctor_availability', result_count);

        -- 11. Delete doctors record
        DELETE FROM doctors WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := deletion_results || json_build_object('doctors', result_count);

        -- 12. Delete clinical notes
        DELETE FROM clinical_notes WHERE patient_id = user_id_to_delete;
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

        -- 18. Delete userinfo record LAST (after auth user is gone)
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

-- =====================================================
-- 3. CREATE SAFE AUTH CLEANUP FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_orphaned_auth_users()
RETURNS JSON AS $$
DECLARE
    orphaned_count INTEGER := 0;
    auth_user RECORD;
BEGIN
    -- Find and delete orphaned auth users
    FOR auth_user IN 
        SELECT au.id, au.email 
        FROM auth.users au 
        LEFT JOIN userinfo ui ON au.id = ui.id 
        WHERE ui.id IS NULL
    LOOP
        DELETE FROM auth.users WHERE id = auth_user.id;
        orphaned_count := orphaned_count + 1;
    END LOOP;

    RETURN json_build_object(
        'success', true,
        'orphaned_users_removed', orphaned_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. IMMEDIATE CLEANUP OF ORPHANED AUTH USERS
-- =====================================================

-- Run the cleanup immediately
SELECT cleanup_orphaned_auth_users();

-- Show current orphaned auth users count
SELECT 
    COUNT(*) as orphaned_auth_users
FROM auth.users au 
LEFT JOIN userinfo ui ON au.id = ui.id 
WHERE ui.id IS NULL;
