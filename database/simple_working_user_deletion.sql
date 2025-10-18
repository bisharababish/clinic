-- SIMPLE WORKING USER DELETION SYSTEM
-- This uses simple JSON building without jsonb_set to avoid function errors
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
-- 2. CREATE SIMPLE USER DELETION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION delete_user_completely(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
    appointment_change_logs_count INTEGER := 0;
    lab_results_count INTEGER := 0;
    lab_attachments_count INTEGER := 0;
    xray_images_count INTEGER := 0;
    payment_transactions_count INTEGER := 0;
    payment_logs_count INTEGER := 0;
    payment_bookings_count INTEGER := 0;
    appointments_patient_count INTEGER := 0;
    appointments_doctor_count INTEGER := 0;
    doctor_availability_count INTEGER := 0;
    doctors_count INTEGER := 0;
    clinical_notes_count INTEGER := 0;
    patient_health_info_count INTEGER := 0;
    deletion_requests_count INTEGER := 0;
    notifications_count INTEGER := 0;
    activity_log_count INTEGER := 0;
    userinfo_count INTEGER := 0;
    auth_users_count INTEGER := 0;
    total_deleted INTEGER := 0;
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
        GET DIAGNOSTICS appointment_change_logs_count = ROW_COUNT;

        -- 2. Delete lab results
        DELETE FROM lab_results WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS lab_results_count = ROW_COUNT;

        -- 3. Delete lab attachments
        DELETE FROM lab_attachments WHERE uploaded_by = user_id_to_delete;
        GET DIAGNOSTICS lab_attachments_count = ROW_COUNT;

        -- 4. Delete X-ray images
        DELETE FROM xray_images WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS xray_images_count = ROW_COUNT;

        -- 5. Delete payment transactions (via payment_bookings)
        DELETE FROM payment_transactions WHERE payment_booking_id IN (
            SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
        );
        GET DIAGNOSTICS payment_transactions_count = ROW_COUNT;

        -- 6. Delete payment logs
        DELETE FROM payment_logs WHERE payment_booking_id IN (
            SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
        );
        GET DIAGNOSTICS payment_logs_count = ROW_COUNT;

        -- 7. Delete payment bookings
        DELETE FROM payment_bookings WHERE patient_id = auth_user_id;
        GET DIAGNOSTICS payment_bookings_count = ROW_COUNT;

        -- 8. Delete appointments (patient_id is bigint in appointments table)
        DELETE FROM appointments WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS appointments_patient_count = ROW_COUNT;

        -- 9. Delete appointments where user is doctor (doctor_id is uuid)
        IF auth_user_id IS NOT NULL THEN
            DELETE FROM appointments WHERE doctor_id = auth_user_id;
            GET DIAGNOSTICS appointments_doctor_count = ROW_COUNT;
        END IF;

        -- 10. Delete doctor availability if user is a doctor
        IF user_record.user_roles ILIKE '%doctor%' AND auth_user_id IS NOT NULL THEN
            DELETE FROM doctor_availability WHERE doctor_id = auth_user_id;
            GET DIAGNOSTICS doctor_availability_count = ROW_COUNT;
        END IF;

        -- 11. Delete from doctors table if user is a doctor
        IF user_record.user_roles ILIKE '%doctor%' THEN
            DELETE FROM doctors WHERE user_id = user_id_to_delete;
            GET DIAGNOSTICS doctors_count = ROW_COUNT;
        END IF;

        -- 12. Delete clinical notes
        DELETE FROM clinical_notes WHERE patient_id = user_id_to_delete OR doctor_id = user_id_to_delete;
        GET DIAGNOSTICS clinical_notes_count = ROW_COUNT;

        -- 13. Delete patient health info
        DELETE FROM patient_health_info WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS patient_health_info_count = ROW_COUNT;

        -- 14. Delete deletion requests
        DELETE FROM deletion_requests WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS deletion_requests_count = ROW_COUNT;

        -- 15. Delete notifications (by email)
        DELETE FROM notifications WHERE user_email = user_record.user_email;
        GET DIAGNOSTICS notifications_count = ROW_COUNT;

        -- 16. Delete activity logs (by email)
        DELETE FROM activity_log WHERE user_email = user_record.user_email;
        GET DIAGNOSTICS activity_log_count = ROW_COUNT;

        -- 17. Delete from userinfo table
        DELETE FROM userinfo WHERE userid = user_id_to_delete;
        GET DIAGNOSTICS userinfo_count = ROW_COUNT;

        -- 18. Try to delete from auth.users if auth_user_id exists
        IF auth_user_id IS NOT NULL THEN
            BEGIN
                DELETE FROM auth.users WHERE id = auth_user_id;
                GET DIAGNOSTICS auth_users_count = ROW_COUNT;
            EXCEPTION WHEN OTHERS THEN
                auth_users_count := -1; -- Mark as failed
            END;
        END IF;

        -- Calculate total
        total_deleted := appointment_change_logs_count + lab_results_count + lab_attachments_count + 
                        xray_images_count + payment_transactions_count + payment_logs_count + 
                        payment_bookings_count + appointments_patient_count + appointments_doctor_count + 
                        doctor_availability_count + doctors_count + clinical_notes_count + 
                        patient_health_info_count + deletion_requests_count + notifications_count + 
                        activity_log_count + userinfo_count + 
                        CASE WHEN auth_users_count >= 0 THEN auth_users_count ELSE 0 END;

        RETURN json_build_object(
            'success', true,
            'userid', user_id_to_delete,
            'user_email', user_record.user_email,
            'user_role', user_record.user_roles,
            'deleted_records', json_build_object(
                'appointment_change_logs', appointment_change_logs_count,
                'lab_results', lab_results_count,
                'lab_attachments', lab_attachments_count,
                'xray_images', xray_images_count,
                'payment_transactions', payment_transactions_count,
                'payment_logs', payment_logs_count,
                'payment_bookings', payment_bookings_count,
                'appointments_as_patient', appointments_patient_count,
                'appointments_as_doctor', appointments_doctor_count,
                'doctor_availability', doctor_availability_count,
                'doctors', doctors_count,
                'clinical_notes', clinical_notes_count,
                'patient_health_info', patient_health_info_count,
                'deletion_requests', deletion_requests_count,
                'notifications', notifications_count,
                'activity_log', activity_log_count,
                'userinfo', userinfo_count,
                'auth_users', auth_users_count
            ),
            'total_deleted', total_deleted,
            'message', 'User and all related data deleted successfully'
        );

    EXCEPTION WHEN OTHERS THEN
        -- Rollback on error
        RAISE EXCEPTION 'Error deleting user: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CREATE SIMPLE DEPENDENCY CHECK FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION check_user_dependencies(user_id_to_delete BIGINT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
    appointment_change_logs_count INTEGER;
    lab_results_count INTEGER;
    lab_attachments_count INTEGER;
    xray_images_count INTEGER;
    payment_bookings_count INTEGER;
    appointments_patient_count INTEGER;
    appointments_doctor_count INTEGER;
    doctor_availability_count INTEGER;
    doctors_count INTEGER;
    clinical_notes_count INTEGER;
    patient_health_info_count INTEGER;
    deletion_requests_count INTEGER;
    notifications_count INTEGER;
    activity_log_count INTEGER;
    auth_users_count INTEGER;
    total_records INTEGER;
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

    -- Count appointment change logs
    SELECT COUNT(*) INTO appointment_change_logs_count FROM appointment_change_logs WHERE patient_id = user_id_to_delete::TEXT;

    -- Count lab results
    SELECT COUNT(*) INTO lab_results_count FROM lab_results WHERE patient_id = user_id_to_delete;

    -- Count lab attachments
    SELECT COUNT(*) INTO lab_attachments_count FROM lab_attachments WHERE uploaded_by = user_id_to_delete;

    -- Count X-ray images
    SELECT COUNT(*) INTO xray_images_count FROM xray_images WHERE patient_id = user_id_to_delete;

    -- Count payment bookings
    SELECT COUNT(*) INTO payment_bookings_count FROM payment_bookings WHERE patient_id = auth_user_id;

    -- Count appointments as patient
    SELECT COUNT(*) INTO appointments_patient_count FROM appointments WHERE patient_id = user_id_to_delete;

    -- Count appointments as doctor (only if auth_user_id exists)
    IF auth_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO appointments_doctor_count FROM appointments WHERE doctor_id = auth_user_id;
    ELSE
        appointments_doctor_count := 0;
    END IF;

    -- Count doctor availability (only if auth_user_id exists)
    IF auth_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO doctor_availability_count FROM doctor_availability WHERE doctor_id = auth_user_id;
    ELSE
        doctor_availability_count := 0;
    END IF;

    -- Count doctors table
    SELECT COUNT(*) INTO doctors_count FROM doctors WHERE user_id = user_id_to_delete;

    -- Count clinical notes
    SELECT COUNT(*) INTO clinical_notes_count FROM clinical_notes WHERE patient_id = user_id_to_delete OR doctor_id = user_id_to_delete;

    -- Count patient health info
    SELECT COUNT(*) INTO patient_health_info_count FROM patient_health_info WHERE patient_id = user_id_to_delete;

    -- Count deletion requests
    SELECT COUNT(*) INTO deletion_requests_count FROM deletion_requests WHERE user_id = user_id_to_delete;

    -- Count notifications (by email)
    SELECT COUNT(*) INTO notifications_count FROM notifications WHERE user_email = user_record.user_email;

    -- Count activity logs (by email)
    SELECT COUNT(*) INTO activity_log_count FROM activity_log WHERE user_email = user_record.user_email;

    -- Count auth user (only if auth_user_id exists)
    IF auth_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO auth_users_count FROM auth.users WHERE id = auth_user_id;
    ELSE
        auth_users_count := 0;
    END IF;

    -- Calculate total
    total_records := appointment_change_logs_count + lab_results_count + lab_attachments_count + 
                    xray_images_count + payment_bookings_count + appointments_patient_count + 
                    appointments_doctor_count + doctor_availability_count + doctors_count + 
                    clinical_notes_count + patient_health_info_count + deletion_requests_count + 
                    notifications_count + activity_log_count + auth_users_count;

    RETURN json_build_object(
        'success', true,
        'userid', user_id_to_delete,
        'user_email', user_record.user_email,
        'user_role', user_record.user_roles,
        'dependencies', json_build_object(
            'appointment_change_logs', appointment_change_logs_count,
            'lab_results', lab_results_count,
            'lab_attachments', lab_attachments_count,
            'xray_images', xray_images_count,
            'payment_bookings', payment_bookings_count,
            'appointments_as_patient', appointments_patient_count,
            'appointments_as_doctor', appointments_doctor_count,
            'doctor_availability', doctor_availability_count,
            'doctors', doctors_count,
            'clinical_notes', clinical_notes_count,
            'patient_health_info', patient_health_info_count,
            'deletion_requests', deletion_requests_count,
            'notifications', notifications_count,
            'activity_log', activity_log_count,
            'auth_users', auth_users_count
        ),
        'total_records', total_records
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
