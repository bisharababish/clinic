-- Fix existing appointments with invalid dates
-- This script will clean up the existing payment_bookings data

-- First, let's see what data we have
SELECT 
    id,
    patient_name,
    clinic_name,
    doctor_name,
    appointment_day,
    appointment_time,
    payment_status,
    created_at
FROM payment_bookings 
WHERE payment_status = 'paid'
ORDER BY created_at DESC;

-- Delete existing appointments with invalid dates
-- These are the ones showing "Invalid Date" in the admin panel
DELETE FROM payment_bookings 
WHERE appointment_day IN (
    'الوقت المختار',  -- Arabic: "The Chosen Time"
    'الوقت المختار',  -- Arabic: "The Chosen Time" 
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'
);

-- Also delete any related payment transactions
DELETE FROM payment_transactions 
WHERE payment_booking_id NOT IN (SELECT id FROM payment_bookings);

-- Verify the cleanup
SELECT COUNT(*) as remaining_appointments FROM payment_bookings WHERE payment_status = 'paid';
