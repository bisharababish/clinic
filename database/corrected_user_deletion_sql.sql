-- CORRECTED USER DELETION SYSTEM - MATCHES ACTUAL SCHEMA
-- This fixes the field name issues based on your actual database schema
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. DROP ALL OLD FUNCTIONS FIRST
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
-- 2. CREATE CORRECTED USER DELETION FUNCTION
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

    -- Get auth user ID from the correct field name
    auth_user_id := user_record.id;

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

        -- 3. Delete lab attachments
        DELETE FROM lab_attachments WHERE uploaded_by = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{lab_attachments}', to_jsonb(result_count));

        -- 4. Delete X-ray images
        DELETE FROM xray_images WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{xray_images}', to_jsonb(result_count));

        -- 5. Delete payment transactions (via payment_bookings)
        DELETE FROM payment_transactions WHERE payment_booking_id IN (
            SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
        );
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{payment_transactions}', to_jsonb(result_count));

        -- 6. Delete payment logs
        DELETE FROM payment_logs WHERE payment_booking_id IN (
            SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
        );
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{payment_logs}', to_jsonb(result_count));

        -- 7. Delete payment bookings
        DELETE FROM payment_bookings WHERE patient_id = auth_user_id;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{payment_bookings}', to_jsonb(result_count));

        -- 8. Delete appointments (patient_id is bigint in appointments table)
        DELETE FROM appointments WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{appointments_as_patient}', to_jsonb(result_count));

        -- 9. Delete appointments where user is doctor (doctor_id is uuid)
        IF auth_user_id IS NOT NULL THEN
            DELETE FROM appointments WHERE doctor_id = auth_user_id;
            GET DIAGNOSTICS result_count = ROW_COUNT;
            deletion_results := jsonb_set(deletion_results, '{appointments_as_doctor}', to_jsonb(result_count));
        ELSE
            deletion_results := jsonb_set(deletion_results, '{appointments_as_doctor}', to_jsonb(0));
        END IF;

        -- 10. Delete doctor availability if user is a doctor
        IF user_record.user_roles ILIKE '%doctor%' AND auth_user_id IS NOT NULL THEN
            DELETE FROM doctor_availability WHERE doctor_id = auth_user_id;
            GET DIAGNOSTICS result_count = ROW_COUNT;
            deletion_results := jsonb_set(deletion_results, '{doctor_availability}', to_jsonb(result_count));
        ELSE
            deletion_results := jsonb_set(deletion_results, '{doctor_availability}', to_jsonb(0));
        END IF;

        -- 11. Delete from doctors table if user is a doctor
        IF user_record.user_roles ILIKE '%doctor%' THEN
            DELETE FROM doctors WHERE user_id = user_id_to_delete;
            GET DIAGNOSTICS result_count = ROW_COUNT;
            deletion_results := jsonb_set(deletion_results, '{doctors}', to_jsonb(result_count));
        ELSE
            deletion_results := jsonb_set(deletion_results, '{doctors}', to_jsonb(0));
        END IF;

        -- 12. Delete clinical notes
        DELETE FROM clinical_notes WHERE patient_id = user_id_to_delete OR doctor_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{clinical_notes}', to_jsonb(result_count));

        -- 13. Delete patient health info
        DELETE FROM patient_health_info WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{patient_health_info}', to_jsonb(result_count));

        -- 14. Delete deletion requests
        DELETE FROM deletion_requests WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{deletion_requests}', to_jsonb(result_count));

        -- 15. Delete notifications (by email)
        DELETE FROM notifications WHERE user_email = user_record.user_email;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{notifications}', to_jsonb(result_count));

        -- 16. Delete activity logs (by email)
        DELETE FROM activity_log WHERE user_email = user_record.user_email;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{activity_log}', to_jsonb(result_count));

        -- 17. Delete from userinfo table
        DELETE FROM userinfo WHERE userid = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{userinfo}', to_jsonb(result_count));

        -- 18. Try to delete from auth.users if auth_user_id exists
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
-- 3. CREATE CORRECTED DEPENDENCY CHECK FUNCTION
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

    -- Get auth user ID from the correct field name
    auth_user_id := user_record.id;

    -- Check appointment change logs
    SELECT COUNT(*) INTO count FROM appointment_change_logs WHERE patient_id = user_id_to_delete::TEXT;
    dependencies := jsonb_set(dependencies, '{appointment_change_logs}', to_jsonb(count));

    -- Check lab results
    SELECT COUNT(*) INTO count FROM lab_results WHERE patient_id = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{lab_results}', to_jsonb(count));

    -- Check lab attachments
    SELECT COUNT(*) INTO count FROM lab_attachments WHERE uploaded_by = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{lab_attachments}', to_jsonb(count));

    -- Check X-ray images
    SELECT COUNT(*) INTO count FROM xray_images WHERE patient_id = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{xray_images}', to_jsonb(count));

    -- Check payment bookings
    SELECT COUNT(*) INTO count FROM payment_bookings WHERE patient_id = auth_user_id;
    dependencies := jsonb_set(dependencies, '{payment_bookings}', to_jsonb(count));

    -- Check appointments as patient
    SELECT COUNT(*) INTO count FROM appointments WHERE patient_id = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{appointments_as_patient}', to_jsonb(count));

    -- Check appointments as doctor (only if auth_user_id exists)
    IF auth_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO count FROM appointments WHERE doctor_id = auth_user_id;
        dependencies := jsonb_set(dependencies, '{appointments_as_doctor}', to_jsonb(count));
    ELSE
        dependencies := jsonb_set(dependencies, '{appointments_as_doctor}', to_jsonb(0));
    END IF;

    -- Check doctor availability (only if auth_user_id exists)
    IF auth_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO count FROM doctor_availability WHERE doctor_id = auth_user_id;
        dependencies := jsonb_set(dependencies, '{doctor_availability}', to_jsonb(count));
    ELSE
        dependencies := jsonb_set(dependencies, '{doctor_availability}', to_jsonb(0));
    END IF;

    -- Check doctors table
    SELECT COUNT(*) INTO count FROM doctors WHERE user_id = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{doctors}', to_jsonb(count));

    -- Check clinical notes
    SELECT COUNT(*) INTO count FROM clinical_notes WHERE patient_id = user_id_to_delete OR doctor_id = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{clinical_notes}', to_jsonb(count));

    -- Check patient health info
    SELECT COUNT(*) INTO count FROM patient_health_info WHERE patient_id = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{patient_health_info}', to_jsonb(count));

    -- Check deletion requests
    SELECT COUNT(*) INTO count FROM deletion_requests WHERE user_id = user_id_to_delete;
    dependencies := jsonb_set(dependencies, '{deletion_requests}', to_jsonb(count));

    -- Check notifications (by email)
    SELECT COUNT(*) INTO count FROM notifications WHERE user_email = user_record.user_email;
    dependencies := jsonb_set(dependencies, '{notifications}', to_jsonb(count));

    -- Check activity logs (by email)
    SELECT COUNT(*) INTO count FROM activity_log WHERE user_email = user_record.user_email;
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

-- Test with Judah Sleibi (ID: 406303941)
-- SELECT check_user_dependencies(406303941);

-- To delete a user completely
-- SELECT delete_user_completely(406303941);
