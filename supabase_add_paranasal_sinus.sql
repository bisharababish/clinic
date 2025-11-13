-- SQL script to add "Paranasal Sinus" body part to X-Ray system
-- ============================================================
-- This script ensures the database is ready to store "paranasal_sinus" 
-- when selected in the X-Ray body parts selector.

-- IMPORTANT: Body parts are stored as TEXT ARRAYS in the xray_images table.
-- The frontend code has been updated to include "paranasal_sinus" in the skull category.
-- When a user selects "Paranasal Sinus", the value "paranasal_sinus" will be 
-- automatically added to the body_part array and saved to the database.

-- ============================================================
-- DATABASE SCHEMA VERIFICATION
-- ============================================================
-- Verify that the body_part column accepts text arrays:
-- SELECT column_name, data_type, udt_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'xray_images' AND column_name = 'body_part';
-- Expected: data_type should be 'ARRAY' and udt_name should be '_text'

-- ============================================================
-- TEST INSERT (Optional - for testing purposes only)
-- ============================================================
-- You can test that "paranasal_sinus" can be inserted:
-- INSERT INTO xray_images (
--     patient_id, 
--     patient_name, 
--     date_of_birth, 
--     body_part, 
--     indication, 
--     requesting_doctor, 
--     image_url
-- ) VALUES (
--     999999,  -- Test patient ID
--     'Test Patient',
--     '2000-01-01',
--     ARRAY['paranasal_sinus', 'skull'],  -- Array including paranasal_sinus
--     'Test indication',
--     'Test Doctor',
--     'test/test.jpg'
-- );

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- 1. Check if any records contain "paranasal_sinus":
SELECT id, patient_name, body_part, created_at
FROM xray_images
WHERE 'paranasal_sinus' = ANY(body_part)
ORDER BY created_at DESC;

-- 2. Count how many records have "paranasal_sinus":
SELECT COUNT(*) as total_records_with_paranasal_sinus
FROM xray_images
WHERE 'paranasal_sinus' = ANY(body_part);

-- 3. List all unique body parts in the database (to verify paranasal_sinus appears):
SELECT DISTINCT unnest(body_part) as body_part_value, COUNT(*) as usage_count
FROM xray_images
GROUP BY unnest(body_part)
ORDER BY body_part_value;

-- ============================================================
-- NOTES
-- ============================================================
-- 1. No database migration is required - the existing text[] column will accept "paranasal_sinus"
-- 2. The frontend code automatically handles adding "paranasal_sinus" to the selectedBodyParts array
-- 3. When the form is submitted, the entire array (including "paranasal_sinus") is saved to body_part
-- 4. The value is stored exactly as "paranasal_sinus" (lowercase with underscore)
-- 5. Translations are handled in the frontend (English: "Paranasal Sinus", Arabic: "الجيوب الأنفية")

-- ============================================================
-- IF YOU HAVE A SEPARATE BODY_PARTS LOOKUP TABLE
-- ============================================================
-- If your system uses a separate lookup table for body parts, uncomment and run:
-- INSERT INTO body_parts (value, label_en, label_ar, category, is_active)
-- VALUES ('paranasal_sinus', 'Paranasal Sinus', 'الجيوب الأنفية', 'skull', true)
-- ON CONFLICT (value) DO UPDATE 
-- SET label_en = EXCLUDED.label_en,
--     label_ar = EXCLUDED.label_ar,
--     category = EXCLUDED.category,
--     is_active = true;

