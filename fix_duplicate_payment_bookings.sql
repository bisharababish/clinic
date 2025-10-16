-- Fix duplicate payment bookings by adding unique constraint
-- This prevents the same appointment from being booked twice

-- First, let's see what duplicates exist
SELECT 
    patient_id, 
    clinic_name, 
    doctor_name, 
    appointment_day, 
    appointment_time,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as ids
FROM payment_bookings
WHERE payment_status IN ('pending', 'paid')
GROUP BY patient_id, clinic_name, doctor_name, appointment_day, appointment_time
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Clean up existing duplicates
-- Keep only the first occurrence of each duplicate appointment
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY patient_id, clinic_name, doctor_name, appointment_day, appointment_time 
            ORDER BY created_at ASC
        ) as row_num
    FROM payment_bookings
    WHERE payment_status IN ('pending', 'paid')
)
DELETE FROM payment_bookings 
WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
);

-- Drop existing constraint if it exists
ALTER TABLE payment_bookings DROP CONSTRAINT IF EXISTS unique_appointment_booking;

-- Add a unique constraint to prevent future duplicates
-- This constraint ensures that the same patient cannot book the same appointment twice
ALTER TABLE payment_bookings 
ADD CONSTRAINT unique_appointment_booking 
UNIQUE (patient_id, clinic_name, doctor_name, appointment_day, appointment_time);

-- Note: This constraint applies to all appointments
-- If you need to allow rebooking cancelled appointments, you can modify this
