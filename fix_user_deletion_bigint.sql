-- QUICK FIX: User Deletion System with BIGINT Support
-- Run this in your Supabase SQL Editor to fix the integer overflow error

-- =====================================================
-- 1. CREATE CHECK USER DEPENDENCIES FUNCTION (BIGINT)
-- =====================================================

CREATE OR REPLACE FUNCTION check_user_dependencies(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
    dependencies JSON := '{}';
    count INTEGER;
BEGIN
    -- Get user information
    SELECT * INTO user_record FROM userinfo WHERE userid = user_id_to_delete;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found',
            'userid', user_id_to_delete
        );
    END IF;

    auth_user_id := user_record.user_id::UUID;

    -- Check appointment change logs
    SELECT COUNT(*) INTO count FROM appointment_change_logs WHERE patient_id = user_id_to_delete::TEXT;
    dependencies := jsonb_set(dependencies, '{appointment_change_logs}', to_jsonb(count));

    -- Check lab results
    SELECT COUNT(*) INTO count FROM lab_results WHERE patient_id = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{lab_results}', to_jsonb(count));

    -- Check X-ray images
    SELECT COUNT(*) INTO count FROM xray_images WHERE patient_id = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{xray_images}', to_jsonb(count));

    -- Check payment transactions
    SELECT COUNT(*) INTO count FROM payment_transactions WHERE patient_id = user_id_to_delete::TEXT;
    dependencies := jsonb_set(dependencies, '{payment_transactions}', to_jsonb(count));

    -- Check payment bookings
    SELECT COUNT(*) INTO count FROM payment_bookings WHERE patient_id = user_id_to_delete::TEXT;
    dependencies := jsonb_set(dependencies, '{payment_bookings}', to_jsonb(count));

    -- Check appointments as patient
    SELECT COUNT(*) INTO count FROM appointments WHERE patient_id = user_id_to_delete::TEXT;
    dependencies := jsonb_set(dependencies, '{appointments_as_patient}', to_jsonb(count));

    -- Check appointments as doctor
    SELECT COUNT(*) INTO count FROM appointments WHERE doctor_id = auth_user_id::TEXT;
    dependencies := jsonb_set(dependencies, '{appointments_as_doctor}', to_jsonb(count));

    -- Check doctor availability
    SELECT COUNT(*) INTO count FROM doctor_availability WHERE doctor_id = auth_user_id::TEXT;
    dependencies := jsonb_set(dependencies, '{doctor_availability}', to_jsonb(count));

    -- Check doctors table
    SELECT COUNT(*) INTO count FROM doctors WHERE id = auth_user_id::TEXT;
    dependencies := jsonb_set(dependencies, '{doctors}', to_jsonb(count));

    -- Check deletion requests
    SELECT COUNT(*) INTO count FROM deletion_requests WHERE user_id = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{deletion_requests}', to_jsonb(count));

    -- Check notifications
    SELECT COUNT(*) INTO count FROM notifications WHERE user_id = user_id_to_delete::TEXT;
    dependencies := jsonb_set(dependencies, '{notifications}', to_jsonb(count));

    -- Check activity logs
    SELECT COUNT(*) INTO count FROM activity_log WHERE user_id = user_id_to_delete::TEXT;
    dependencies := jsonb_set(dependencies, '{activity_log}', to_jsonb(count));

    -- Check auth user
    SELECT COUNT(*) INTO count FROM auth.users WHERE id = auth_user_id;
    dependencies := jsonb_set(dependencies, '{auth_users}', to_jsonb(count));

    RETURN json_build_object(
        'success', true,
        'userid', user_id_to_delete,
        'user_email', user_record.user_email,
        'user_role', user_record.user_roles,
        'dependencies', dependencies,
        'total_records', (
            SELECT SUM(value::integer) 
            FROM jsonb_each(dependencies) 
            WHERE value::text ~ '^[0-9]+$'
        )
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. CREATE COMPLETE USER DELETION FUNCTION (BIGINT)
-- =====================================================

CREATE OR REPLACE FUNCTION delete_user_and_auth_completely(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
    deletion_results JSON := '{}';
    result_count INTEGER := 0;
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

    auth_user_id := user_record.user_id::UUID;

    -- Start transaction for atomic deletion
    BEGIN
        -- 1. Delete appointment change logs
        DELETE FROM appointment_change_logs WHERE patient_id = user_id_to_delete::TEXT;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{appointment_change_logs}', to_jsonb(result_count));

        -- 2. Delete lab results
        DELETE FROM lab_results WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{lab_results}', to_jsonb(result_count));

        -- 3. Delete X-ray images
        DELETE FROM xray_images WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{xray_images}', to_jsonb(result_count));

        -- 4. Delete payment transactions
        DELETE FROM payment_transactions WHERE patient_id = user_id_to_delete::TEXT;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{payment_transactions}', to_jsonb(result_count));

        -- 5. Delete payment bookings
        DELETE FROM payment_bookings WHERE patient_id = user_id_to_delete::TEXT;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{payment_bookings}', to_jsonb(result_count));

        -- 6. Delete appointments (both as patient and doctor)
        DELETE FROM appointments WHERE patient_id = user_id_to_delete::TEXT;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{appointments_as_patient}', to_jsonb(result_count));

        DELETE FROM appointments WHERE doctor_id = auth_user_id::TEXT;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{appointments_as_doctor}', to_jsonb(result_count));

        -- 7. Delete doctor availability if user is a doctor
        IF user_record.user_roles ILIKE '%doctor%' THEN
            DELETE FROM doctor_availability WHERE doctor_id = auth_user_id::TEXT;
            GET DIAGNOSTICS result_count = ROW_COUNT;
            deletion_results := jsonb_set(deletion_results, '{doctor_availability}', to_jsonb(result_count));
        END IF;

        -- 8. Delete from doctors table if user is a doctor
        IF user_record.user_roles ILIKE '%doctor%' THEN
            DELETE FROM doctors WHERE id = auth_user_id::TEXT;
            GET DIAGNOSTICS result_count = ROW_COUNT;
            deletion_results := jsonb_set(deletion_results, '{doctors}', to_jsonb(result_count));
        END IF;

        -- 9. Delete deletion requests
        DELETE FROM deletion_requests WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{deletion_requests}', to_jsonb(result_count));

        -- 10. Delete notifications
        DELETE FROM notifications WHERE user_id = user_id_to_delete::TEXT;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{notifications}', to_jsonb(result_count));

        -- 11. Delete activity logs
        DELETE FROM activity_log WHERE user_id = user_id_to_delete::TEXT;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{activity_log}', to_jsonb(result_count));

        -- 12. Delete from userinfo table
        DELETE FROM userinfo WHERE userid = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{userinfo}', to_jsonb(result_count));

        RETURN json_build_object(
            'success', true,
            'userid', user_id_to_delete,
            'user_email', user_record.user_email,
            'user_role', user_record.user_roles,
            'deleted_records', deletion_results,
            'message', 'User and all related data deleted successfully'
        );

    EXCEPTION WHEN OTHERS THEN
        -- Rollback on error
        RAISE EXCEPTION 'Error deleting user: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION check_user_dependencies(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_and_auth_completely(BIGINT) TO authenticated;

-- =====================================================
-- 4. TEST THE FUNCTIONS
-- =====================================================

-- Test with a real user ID (replace with actual userid)
-- SELECT check_user_dependencies(1746219539694);

-- To delete a user completely (replace with actual userid)
-- SELECT delete_user_and_auth_completely(1746219539694);
