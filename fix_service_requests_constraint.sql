-- =====================================================
-- FIX SERVICE_REQUESTS FOREIGN KEY CONSTRAINT
-- =====================================================
-- The issue: doctor_id has ON DELETE SET NULL but is NOT NULL
-- This causes constraint violations when deleting users
-- 
-- Solution: Change ON DELETE SET NULL to ON DELETE CASCADE
-- OR make doctor_id nullable (but this might break business logic)
-- =====================================================

-- Option 1: Change to CASCADE (Recommended)
-- This will delete service_requests when the doctor is deleted
ALTER TABLE public.service_requests
DROP CONSTRAINT IF EXISTS fk_service_requests_doctor;

ALTER TABLE public.service_requests
ADD CONSTRAINT fk_service_requests_doctor 
FOREIGN KEY (doctor_id) 
REFERENCES public.userinfo(userid) 
ON DELETE CASCADE;

-- Option 2: Make doctor_id nullable (Alternative)
-- Only use this if you want to keep service_requests when doctor is deleted
-- ALTER TABLE public.service_requests
-- ALTER COLUMN doctor_id DROP NOT NULL;

-- =====================================================
-- VERIFY THE CHANGE
-- =====================================================
-- After running this, check the constraint:
-- SELECT 
--     tc.constraint_name, 
--     tc.table_name, 
--     kcu.column_name,
--     ccu.table_name AS foreign_table_name,
--     ccu.column_name AS foreign_column_name,
--     rc.delete_rule
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- JOIN information_schema.referential_constraints AS rc
--   ON rc.constraint_name = tc.constraint_name
-- WHERE tc.table_name = 'service_requests' 
--   AND tc.constraint_type = 'FOREIGN KEY'
--   AND kcu.column_name = 'doctor_id';

