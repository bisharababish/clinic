-- Fix existing payment_bookings records that have "Unknown Patient"
-- This script will update existing payment bookings with proper patient information

-- First, let's see what data we have
SELECT 
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN patient_name IS NULL OR patient_name = 'Unknown Patient' THEN 1 END) as unknown_patients,
    COUNT(CASE WHEN patient_name IS NOT NULL AND patient_name != 'Unknown Patient' THEN 1 END) as known_patients
FROM payment_bookings;

-- Update payment_bookings with patient information from userinfo table
-- This will fix existing records that have "Unknown Patient"
UPDATE payment_bookings 
SET 
    patient_name = COALESCE(
        TRIM(CONCAT(
            COALESCE(ui.english_username_a, ''), 
            ' ', 
            COALESCE(ui.english_username_d, '')
        )),
        'Unknown Patient'
    ),
    patient_email = COALESCE(ui.user_email, ''),
    patient_phone = COALESCE(ui.user_phonenumber, ''),
    unique_patient_id = COALESCE(ui.unique_patient_id, '')
FROM userinfo ui
WHERE payment_bookings.patient_id = ui.id
AND (payment_bookings.patient_name IS NULL 
     OR payment_bookings.patient_name = 'Unknown Patient'
     OR payment_bookings.patient_name = '');

-- Verify the update worked
SELECT 
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN patient_name IS NULL OR patient_name = 'Unknown Patient' THEN 1 END) as unknown_patients,
    COUNT(CASE WHEN patient_name IS NOT NULL AND patient_name != 'Unknown Patient' THEN 1 END) as known_patients
FROM payment_bookings;

-- Show some examples of the updated data
SELECT 
    id,
    patient_name,
    patient_email,
    patient_phone,
    unique_patient_id,
    clinic_name,
    doctor_name,
    created_at
FROM payment_bookings 
ORDER BY created_at DESC 
LIMIT 10;
