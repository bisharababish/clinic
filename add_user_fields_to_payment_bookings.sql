-- Add missing user information fields to payment_bookings table
-- This will help track user information directly in the payment booking

-- Add the missing fields to payment_bookings table
ALTER TABLE payment_bookings 
ADD COLUMN IF NOT EXISTS patient_name TEXT,
ADD COLUMN IF NOT EXISTS patient_email TEXT,
ADD COLUMN IF NOT EXISTS patient_phone TEXT,
ADD COLUMN IF NOT EXISTS unique_patient_id TEXT;

-- Add comments to document the fields
COMMENT ON COLUMN payment_bookings.patient_name IS 'Patient full name for quick reference';
COMMENT ON COLUMN payment_bookings.patient_email IS 'Patient email for quick reference';
COMMENT ON COLUMN payment_bookings.patient_phone IS 'Patient phone for quick reference';
COMMENT ON COLUMN payment_bookings.unique_patient_id IS 'Patient unique ID for quick reference';

-- Verify the new fields were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payment_bookings' 
AND column_name IN ('patient_name', 'patient_email', 'patient_phone', 'unique_patient_id')
ORDER BY column_name;
