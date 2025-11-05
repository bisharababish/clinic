-- Debug query to see what appointments exist for a user
-- Replace 'USER_EMAIL_HERE' with the actual user email that's having the issue

-- 1. Check all appointments for the user (including deleted/cancelled)
SELECT 
    id,
    patient_id,
    patient_email,
    patient_name,
    clinic_name,
    doctor_name,
    appointment_day,
    appointment_time,
    payment_status,
    booking_status,
    deleted,
    created_at
FROM payment_bookings
WHERE patient_email = 'USER_EMAIL_HERE'  -- Replace with actual email
ORDER BY created_at DESC;

-- 2. Check only active appointments (not deleted, not cancelled)
SELECT 
    id,
    patient_id,
    patient_email,
    patient_name,
    clinic_name,
    doctor_name,
    appointment_day,
    appointment_time,
    payment_status,
    booking_status,
    deleted,
    created_at
FROM payment_bookings
WHERE patient_email = 'USER_EMAIL_HERE'  -- Replace with actual email
    AND deleted = false
    AND booking_status != 'cancelled'
ORDER BY created_at DESC;

-- 3. Check if there are any appointments with the same date but different clinic/doctor
SELECT 
    id,
    clinic_name,
    doctor_name,
    appointment_day,
    appointment_time,
    deleted,
    booking_status
FROM payment_bookings
WHERE patient_email = 'USER_EMAIL_HERE'  -- Replace with actual email
    AND appointment_day = '2025-11-10'  -- Replace with the date from error
    AND deleted = false
    AND booking_status != 'cancelled';

-- 4. Check user's auth ID to see if patient_id matches
SELECT 
    u.id as auth_user_id,
    u.email as auth_email,
    ui.userid as userinfo_userid,
    ui.user_email as userinfo_email
FROM auth.users u
LEFT JOIN userinfo ui ON u.id = ui.id
WHERE u.email = 'USER_EMAIL_HERE';  -- Replace with actual email

