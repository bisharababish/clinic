-- AUTO AUTH CLEANUP SYSTEM
-- This automatically removes users from Supabase Auth when they're deleted from your tables

-- =====================================================
-- 1. CREATE FUNCTION TO CLEAN UP ALL ORPHANED AUTH USERS
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_orphaned_auth_users()
RETURNS JSON AS $$
DECLARE
    auth_user_record RECORD;
    deleted_count INTEGER := 0;
    failed_count INTEGER := 0;
    deleted_users TEXT[] := '{}';
    failed_users TEXT[] := '{}';
BEGIN
    -- Loop through all auth users that don't exist in userinfo
    FOR auth_user_record IN 
        SELECT au.id, au.email 
        FROM auth.users au
        LEFT JOIN userinfo u ON au.id = u.id
        WHERE u.id IS NULL
    LOOP
        BEGIN
            -- Try to delete the auth user
            DELETE FROM auth.users WHERE id = auth_user_record.id;
            
            -- If successful, add to deleted list
            deleted_count := deleted_count + 1;
            deleted_users := array_append(deleted_users, auth_user_record.email);
            
        EXCEPTION WHEN OTHERS THEN
            -- If failed, add to failed list
            failed_count := failed_count + 1;
            failed_users := array_append(failed_users, auth_user_record.email || ': ' || SQLERRM);
        END;
    END LOOP;

    RETURN json_build_object(
        'success', true,
        'deleted_count', deleted_count,
        'failed_count', failed_count,
        'deleted_users', deleted_users,
        'failed_users', failed_users,
        'message', 'Orphaned auth users cleanup completed'
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. CREATE FUNCTION TO DELETE USER WITH AUTO AUTH CLEANUP
-- =====================================================

CREATE OR REPLACE FUNCTION delete_user_with_auto_auth_cleanup(user_id_to_delete BIGINT)
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

        -- Try to delete from auth.users
        IF auth_user_id IS NOT NULL THEN
            BEGIN
                DELETE FROM auth.users WHERE id = auth_user_id;
                GET DIAGNOSTICS result_count = ROW_COUNT;
                deletion_results := jsonb_set(deletion_results, '{auth_users}', to_jsonb(result_count));
                auth_deletion_success := true;
            EXCEPTION WHEN OTHERS THEN
                deletion_results := jsonb_set(deletion_results, '{auth_users}', to_jsonb('Auth deletion failed: ' || SQLERRM));
                auth_deletion_success := false;
            END;
        END IF;

        RETURN json_build_object(
            'success', true,
            'userid', user_id_to_delete,
            'user_email', user_record.user_email,
            'user_role', user_record.user_roles,
            'deleted_records', deletion_results,
            'auth_deletion_success', auth_deletion_success,
            'message', 'User deleted successfully with auto auth cleanup'
        );

    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Error deleting user: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION cleanup_orphaned_auth_users() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_with_auto_auth_cleanup(BIGINT) TO authenticated;

-- =====================================================
-- 4. IMMEDIATE CLEANUP - REMOVE ALL ORPHANED AUTH USERS
-- =====================================================

-- This will automatically remove ALL users that were deleted from your tables but still exist in auth.users
SELECT cleanup_orphaned_auth_users();

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

-- Check remaining auth users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Check if any orphaned users remain
SELECT 
    au.id, 
    au.email, 
    'Orphaned - should be deleted' as status
FROM auth.users au
LEFT JOIN userinfo u ON au.id = u.id
WHERE u.id IS NULL;
