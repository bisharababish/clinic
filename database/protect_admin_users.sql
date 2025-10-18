-- PROTECT ADMIN USERS FROM ACCIDENTAL DELETION
-- This adds a safety check to prevent deleting admin users

-- =====================================================
-- 1. CREATE SAFE USER DELETION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION delete_user_safely(user_id_to_delete BIGINT)
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

    -- SAFETY CHECK: Prevent deleting admin users
    IF user_record.user_roles ILIKE '%admin%' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Cannot delete admin users for security reasons',
            'userid', user_id_to_delete,
            'user_email', user_record.user_email,
            'user_role', user_record.user_roles,
            'message', 'Admin users are protected from deletion'
        );
    END IF;

    -- Get auth user ID
    auth_user_id := user_record.id;

    -- Start transaction for atomic deletion
    BEGIN
        -- Delete all related data (same as before)
        DELETE FROM appointment_change_logs WHERE patient_id = user_id_to_delete::TEXT;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{appointment_change_logs}', to_jsonb(result_count));

        DELETE FROM lab_results WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{lab_results}', to_jsonb(result_count));

        DELETE FROM lab_attachments WHERE uploaded_by = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{lab_attachments}', to_jsonb(result_count));

        DELETE FROM xray_images WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{xray_images}', to_jsonb(result_count));

        DELETE FROM payment_transactions WHERE payment_booking_id IN (
            SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
        );
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{payment_transactions}', to_jsonb(result_count));

        DELETE FROM payment_logs WHERE payment_booking_id IN (
            SELECT id FROM payment_bookings WHERE patient_id = auth_user_id
        );
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{payment_logs}', to_jsonb(result_count));

        DELETE FROM payment_bookings WHERE patient_id = auth_user_id;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{payment_bookings}', to_jsonb(result_count));

        DELETE FROM appointments WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{appointments_as_patient}', to_jsonb(result_count));

        IF auth_user_id IS NOT NULL THEN
            DELETE FROM appointments WHERE doctor_id = auth_user_id;
            GET DIAGNOSTICS result_count = ROW_COUNT;
            deletion_results := jsonb_set(deletion_results, '{appointments_as_doctor}', to_jsonb(result_count));
        END IF;

        IF user_record.user_roles ILIKE '%doctor%' AND auth_user_id IS NOT NULL THEN
            DELETE FROM doctor_availability WHERE doctor_id = auth_user_id;
            GET DIAGNOSTICS result_count = ROW_COUNT;
            deletion_results := jsonb_set(deletion_results, '{doctor_availability}', to_jsonb(result_count));
        END IF;

        IF user_record.user_roles ILIKE '%doctor%' THEN
            DELETE FROM doctors WHERE user_id = user_id_to_delete;
            GET DIAGNOSTICS result_count = ROW_COUNT;
            deletion_results := jsonb_set(deletion_results, '{doctors}', to_jsonb(result_count));
        END IF;

        DELETE FROM clinical_notes WHERE patient_id = user_id_to_delete OR doctor_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{clinical_notes}', to_jsonb(result_count));

        DELETE FROM patient_health_info WHERE patient_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{patient_health_info}', to_jsonb(result_count));

        DELETE FROM deletion_requests WHERE user_id = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{deletion_requests}', to_jsonb(result_count));

        DELETE FROM notifications WHERE user_email = user_record.user_email;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{notifications}', to_jsonb(result_count));

        DELETE FROM activity_log WHERE user_email = user_record.user_email;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{activity_log}', to_jsonb(result_count));

        DELETE FROM userinfo WHERE userid = user_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{userinfo}', to_jsonb(result_count));

        IF auth_user_id IS NOT NULL THEN
            BEGIN
                DELETE FROM auth.users WHERE id = auth_user_id;
                GET DIAGNOSTICS result_count = ROW_COUNT;
                deletion_results := jsonb_set(deletion_results, '{auth_users}', to_jsonb(result_count));
            EXCEPTION WHEN OTHERS THEN
                deletion_results := jsonb_set(deletion_results, '{auth_users}', to_jsonb('Auth deletion failed'));
            END;
        END IF;

        RETURN json_build_object(
            'success', true,
            'userid', user_id_to_delete,
            'user_email', user_record.user_email,
            'user_role', user_record.user_roles,
            'deleted_records', deletion_results,
            'message', 'User deleted successfully (admin protection active)'
        );

    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Error deleting user: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION delete_user_safely(BIGINT) TO authenticated;

-- =====================================================
-- 3. TEST THE SAFETY FEATURE
-- =====================================================

-- This should fail with admin protection message
-- SELECT delete_user_safely(1); -- Replace with actual admin userid

-- This should work for non-admin users
-- SELECT delete_user_safely(123); -- Replace with actual non-admin userid
