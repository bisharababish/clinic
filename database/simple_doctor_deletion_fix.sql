-- SIMPLE DOCTOR DELETION FIX
-- This creates a simple function to completely delete a doctor and all their data
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. CREATE SIMPLE DOCTOR DELETION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION delete_doctor_completely(doctor_id_to_delete TEXT)
RETURNS JSON AS $$
DECLARE
    doctor_record RECORD;
    auth_user_id UUID;
    deletion_results JSON := '{}';
    result_count INTEGER := 0;
BEGIN
    -- Get doctor information first
    SELECT * INTO doctor_record FROM doctors WHERE id = doctor_id_to_delete;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Doctor not found',
            'doctor_id', doctor_id_to_delete
        );
    END IF;

    -- Get auth user ID from doctor record
    auth_user_id := doctor_record.user_id::UUID;

    -- Start transaction for atomic deletion
    BEGIN
        -- 1. Delete appointments where this doctor is assigned
        DELETE FROM appointments WHERE doctor_id = doctor_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{appointments}', to_jsonb(result_count));

        -- 2. Delete doctor availability slots
        DELETE FROM doctor_availability WHERE doctor_id = doctor_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{doctor_availability}', to_jsonb(result_count));

        -- 3. Delete doctor from doctors table
        DELETE FROM doctors WHERE id = doctor_id_to_delete;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{doctors}', to_jsonb(result_count));

        -- 4. Delete from userinfo table (if doctor has user profile)
        DELETE FROM userinfo WHERE user_id = auth_user_id::TEXT;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{userinfo}', to_jsonb(result_count));

        -- 5. Delete from auth.users (Supabase Auth)
        DELETE FROM auth.users WHERE id = auth_user_id;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        deletion_results := jsonb_set(deletion_results, '{auth_users}', to_jsonb(result_count));

        RETURN json_build_object(
            'success', true,
            'doctor_id', doctor_id_to_delete,
            'doctor_name', doctor_record.name,
            'deleted_records', deletion_results,
            'message', 'Doctor and all related data deleted successfully'
        );

    EXCEPTION WHEN OTHERS THEN
        -- Rollback on error
        RAISE EXCEPTION 'Error deleting doctor: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION delete_doctor_completely(TEXT) TO authenticated;

-- =====================================================
-- 3. TEST THE FUNCTION
-- =====================================================

-- Test with a real doctor ID (replace with actual doctor ID)
-- SELECT delete_doctor_completely('your-doctor-id-here');
