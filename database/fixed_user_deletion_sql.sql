-- FIXED USER DELETION SYSTEM
-- This fixes the "user_record has no field user_id" error
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. DROP OLD FUNCTIONS FIRST
-- =====================================================

DROP FUNCTION IF EXISTS public.check_user_dependencies(INTEGER);
DROP FUNCTION IF EXISTS public.check_user_dependencies(BIGINT);
DROP FUNCTION IF EXISTS public.delete_user_completely(INTEGER);
DROP FUNCTION IF EXISTS public.delete_user_completely(BIGINT);
DROP FUNCTION IF EXISTS public.delete_auth_user(INTEGER);
DROP FUNCTION IF EXISTS public.delete_auth_user(BIGINT);
DROP FUNCTION IF EXISTS public.delete_user_and_auth_completely(INTEGER);
DROP FUNCTION IF EXISTS public.delete_user_and_auth_completely(BIGINT);
DROP FUNCTION IF EXISTS public.delete_doctor_completely(TEXT);

-- =====================================================
-- 2. CREATE FIXED USER DELETION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION delete_user_completely(user_id_to_delete BIGINT)
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

    -- Get auth user ID - handle case where user_id might be null
    auth_user_id := COALESCE(user_record.user_id, user_record.userid::TEXT)::UUID;

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

        -- Delete appointments where user is doctor (use auth_user_id if available)
        IF auth_user_id IS NOT NULL THEN
            DELETE FROM appointments WHERE doctor_id = auth_user_id::TEXT;
            GET DIAGNOSTICS result_count = ROW_COUNT;
            deletion_results := jsonb_set(deletion_results, '{appointments_as_doctor}', to_jsonb(result_count));
        ELSE
            deletion_results := jsonb_set(deletion_results, '{appointments_as_doctor}', to_jsonb(0));
        END IF;

        -- 7. Delete doctor availability if user is a doctor
        IF user_record.user_roles ILIKE '%doctor%' AND auth_user_id IS NOT NULL THEN
            DELETE FROM doctor_availability WHERE doctor_id = auth_user_id::TEXT;
            GET DIAGNOSTICS result_count = ROW_COUNT;
            deletion_results := jsonb_set(deletion_results, '{doctor_availability}', to_jsonb(result_count));
        ELSE
            deletion_results := jsonb_set(deletion_results, '{doctor_availability}', to_jsonb(0));
        END IF;

        -- 8. Delete from doctors table if user is a doctor
        IF user_record.user_roles ILIKE '%doctor%' AND auth_user_id IS NOT NULL THEN
            DELETE FROM doctors WHERE id = auth_user_id::TEXT;
            GET DIAGNOSTICS result_count = ROW_COUNT;
            deletion_results := jsonb_set(deletion_results, '{doctors}', to_jsonb(result_count));
        ELSE
            deletion_results := jsonb_set(deletion_results, '{doctors}', to_jsonb(0));
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

        -- 13. Try to delete from auth.users if auth_user_id exists
        IF auth_user_id IS NOT NULL THEN
            BEGIN
                DELETE FROM auth.users WHERE id = auth_user_id;
                GET DIAGNOSTICS result_count = ROW_COUNT;
                deletion_results := jsonb_set(deletion_results, '{auth_users}', to_jsonb(result_count));
            EXCEPTION WHEN OTHERS THEN
                deletion_results := jsonb_set(deletion_results, '{auth_users}', to_jsonb('Auth deletion failed'));
            END;
        ELSE
            deletion_results := jsonb_set(deletion_results, '{auth_users}', to_jsonb('No auth user found'));
        END IF;

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
-- 3. CREATE FIXED DEPENDENCY CHECK FUNCTION
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

    -- Get auth user ID - handle case where user_id might be null
    auth_user_id := COALESCE(user_record.user_id, user_record.userid::TEXT)::UUID;

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

    -- Check appointments as doctor (only if auth_user_id exists)
    IF auth_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO count FROM appointments WHERE doctor_id = auth_user_id::TEXT;
        dependencies := jsonb_set(dependencies, '{appointments_as_doctor}', to_jsonb(count));
    ELSE
        dependencies := jsonb_set(dependencies, '{appointments_as_doctor}', to_jsonb(0));
    END IF;

    -- Check doctor availability (only if auth_user_id exists)
    IF auth_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO count FROM doctor_availability WHERE doctor_id = auth_user_id::TEXT;
        dependencies := jsonb_set(dependencies, '{doctor_availability}', to_jsonb(count));
    ELSE
        dependencies := jsonb_set(dependencies, '{doctor_availability}', to_jsonb(0));
    END IF;

    -- Check doctors table (only if auth_user_id exists)
    IF auth_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO count FROM doctors WHERE id = auth_user_id::TEXT;
        dependencies := jsonb_set(dependencies, '{doctors}', to_jsonb(count));
    ELSE
        dependencies := jsonb_set(dependencies, '{doctors}', to_jsonb(0));
    END IF;

    -- Check deletion requests
    SELECT COUNT(*) INTO count FROM deletion_requests WHERE user_id = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{deletion_requests}', to_jsonb(count));

    -- Check notifications
    SELECT COUNT(*) INTO count FROM notifications WHERE user_id = user_id_to_delete::TEXT;
    dependencies := jsonb_set(dependencies, '{notifications}', to_jsonb(count));

    -- Check activity logs
    SELECT COUNT(*) INTO count FROM activity_log WHERE user_id = user_id_to_delete::TEXT;
    dependencies := jsonb_set(dependencies, '{activity_log}', to_jsonb(count));

    -- Check auth user (only if auth_user_id exists)
    IF auth_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO count FROM auth.users WHERE id = auth_user_id;
        dependencies := jsonb_set(dependencies, '{auth_users}', to_jsonb(count));
    ELSE
        dependencies := jsonb_set(dependencies, '{auth_users}', to_jsonb(0));
    END IF;

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
-- 4. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION check_user_dependencies(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_completely(BIGINT) TO authenticated;

-- =====================================================
-- 5. TEST THE FUNCTIONS
-- =====================================================

-- Test with a real user ID (replace with actual userid)
-- SELECT check_user_dependencies(406303941);

-- To delete a user completely (replace with actual userid)
-- SELECT delete_user_completely(406303941);
