-- Test Script for Complete User Deletion System
-- Run this in Supabase SQL Editor to test the system

-- =====================================================
-- 1. CREATE A TEST USER FOR TESTING
-- =====================================================

-- First, let's create a test user to test deletion
INSERT INTO userinfo (
    user_email,
    english_username_a,
    english_username_d,
    user_roles,
    user_password,
    created_at,
    updated_at
) VALUES (
    'test-deletion@example.com',
    'Test',
    'User',
    'Patient',
    'testpassword123',
    NOW(),
    NOW()
) RETURNING userid;

-- Note: Copy the returned userid for the test below

-- =====================================================
-- 2. CREATE SOME TEST DATA
-- =====================================================

-- Get the test user ID (replace 999 with actual userid from above)
-- Let's assume the userid is 999 for this example

-- Create test appointment
INSERT INTO appointments (
    patient_id,
    doctor_id,
    clinic_id,
    date,
    time,
    status,
    payment_status,
    price,
    created_at,
    updated_at
) VALUES (
    '999',
    'test-doctor-uuid',
    'test-clinic-uuid',
    '2024-01-15',
    '10:00',
    'scheduled',
    'pending',
    100.00,
    NOW(),
    NOW()
);

-- Create test payment booking
INSERT INTO payment_bookings (
    patient_id,
    clinic_name,
    doctor_name,
    appointment_day,
    appointment_time,
    price,
    payment_status,
    created_at
) VALUES (
    '999',
    'Test Clinic',
    'Test Doctor',
    '2024-01-15',
    '10:00',
    100.00,
    'pending',
    NOW()
);

-- Create test lab result
INSERT INTO lab_results (
    patient_id,
    patient_name,
    patient_email,
    test_type,
    result_value,
    created_at
) VALUES (
    999,
    'Test User',
    'test-deletion@example.com',
    'Blood Test',
    'Normal',
    NOW()
);

-- Create test X-ray image
INSERT INTO xray_images (
    patient_id,
    patient_name,
    date_of_birth,
    body_part,
    image_url,
    created_at
) VALUES (
    999,
    'Test User',
    '1990-01-01',
    'Chest',
    'https://example.com/xray.jpg',
    NOW()
);

-- Create test appointment change log
INSERT INTO appointment_change_logs (
    patient_id,
    patient_name,
    patient_email,
    original_appointment_id,
    action_type,
    original_date,
    original_time,
    created_at
) VALUES (
    '999',
    'Test User',
    'test-deletion@example.com',
    'test-appointment-id',
    'reschedule',
    '2024-01-15',
    '10:00',
    NOW()
);

-- Create test activity log
INSERT INTO activity_log (
    user_id,
    action,
    description,
    created_at
) VALUES (
    '999',
    'test_action',
    'Test user activity',
    NOW()
);

-- =====================================================
-- 3. TEST THE DEPENDENCY CHECK FUNCTION
-- =====================================================

-- Check what will be deleted (replace 999 with actual userid)
SELECT check_user_dependencies(999);

-- Expected result: Should show counts of all test data created above

-- =====================================================
-- 4. TEST COMPLETE DELETION
-- =====================================================

-- Perform complete deletion (replace 999 with actual userid)
SELECT delete_user_and_auth_completely(999);

-- Expected result: Should show successful deletion of all test data

-- =====================================================
-- 5. VERIFY DELETION
-- =====================================================

-- Verify user is completely deleted
SELECT * FROM userinfo WHERE userid = 999;
-- Expected: No results

-- Verify all related data is deleted
SELECT COUNT(*) as appointments_count FROM appointments WHERE patient_id = '999';
SELECT COUNT(*) as payment_bookings_count FROM payment_bookings WHERE patient_id = '999';
SELECT COUNT(*) as lab_results_count FROM lab_results WHERE patient_id = 999;
SELECT COUNT(*) as xray_images_count FROM xray_images WHERE patient_id = 999;
SELECT COUNT(*) as appointment_change_logs_count FROM appointment_change_logs WHERE patient_id = '999';
SELECT COUNT(*) as activity_log_count FROM activity_log WHERE user_id = '999';

-- All counts should be 0

-- =====================================================
-- 6. CLEANUP TEST DATA (if needed)
-- =====================================================

-- If you need to clean up any remaining test data
-- DELETE FROM appointments WHERE patient_id = '999';
-- DELETE FROM payment_bookings WHERE patient_id = '999';
-- DELETE FROM lab_results WHERE patient_id = 999;
-- DELETE FROM xray_images WHERE patient_id = 999;
-- DELETE FROM appointment_change_logs WHERE patient_id = '999';
-- DELETE FROM activity_log WHERE user_id = '999';
-- DELETE FROM userinfo WHERE userid = 999;

-- =====================================================
-- 7. TEST WITH REAL USER (OPTIONAL)
-- =====================================================

-- To test with a real user, replace 999 with the actual userid
-- Make sure to backup important data first!

-- Example:
-- SELECT check_user_dependencies(YOUR_REAL_USERID);
-- SELECT delete_user_and_auth_completely(YOUR_REAL_USERID);
