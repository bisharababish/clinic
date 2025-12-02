-- =====================================================
-- FIX USER UNIQUE CONSTRAINT
-- =====================================================
-- This script modifies the unique constraint on userinfo table
-- to allow users with the same first name, as long as they have
-- different father's names (second name).
-- 
-- Changes:
-- 1. Drop existing unique constraint on arabic_username_a (if exists)
-- 2. Drop existing unique constraint on english_username_a (if exists)
-- 3. Create new composite unique constraint on (arabic_username_a, arabic_username_b)
-- 4. Create new composite unique constraint on (english_username_a, english_username_b)
-- =====================================================

-- Step 1: Find and drop any existing unique constraint on arabic_username_a
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find unique constraint on arabic_username_a
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.userinfo'::regclass
      AND contype = 'u'
      AND (
          -- Check if constraint involves arabic_username_a
          EXISTS (
              SELECT 1
              FROM pg_constraint c
              JOIN pg_attribute a ON a.attrelid = c.conrelid
              WHERE c.oid = pg_constraint.oid
                AND a.attname = 'arabic_username_a'
                AND a.attnum = ANY(c.conkey)
                AND array_length(c.conkey, 1) = 1  -- Single column constraint
          )
      );

    -- Drop the constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.userinfo DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Dropped existing unique constraint on arabic_username_a: %', constraint_name;
    ELSE
        RAISE NOTICE 'No single-column unique constraint on arabic_username_a found';
    END IF;
END $$;

-- Step 2: Find and drop any existing unique constraint on english_username_a
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find unique constraint on english_username_a
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.userinfo'::regclass
      AND contype = 'u'
      AND (
          -- Check if constraint involves english_username_a
          EXISTS (
              SELECT 1
              FROM pg_constraint c
              JOIN pg_attribute a ON a.attrelid = c.conrelid
              WHERE c.oid = pg_constraint.oid
                AND a.attname = 'english_username_a'
                AND a.attnum = ANY(c.conkey)
                AND array_length(c.conkey, 1) = 1  -- Single column constraint
          )
      );

    -- Drop the constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.userinfo DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Dropped existing unique constraint on english_username_a: %', constraint_name;
    ELSE
        RAISE NOTICE 'No single-column unique constraint on english_username_a found';
    END IF;
END $$;

-- Step 3: Check if composite unique constraint on Arabic names already exists
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_attribute a1 ON a1.attrelid = c.conrelid AND a1.attnum = c.conkey[1]
        JOIN pg_attribute a2 ON a2.attrelid = c.conrelid AND a2.attnum = c.conkey[2]
        WHERE c.conrelid = 'public.userinfo'::regclass
          AND c.contype = 'u'
          AND array_length(c.conkey, 1) = 2
          AND a1.attname = 'arabic_username_a'
          AND a2.attname = 'arabic_username_b'
    ) INTO constraint_exists;

    IF NOT constraint_exists THEN
        -- Create composite unique constraint for Arabic names
        ALTER TABLE public.userinfo
        ADD CONSTRAINT userinfo_arabic_name_unique 
        UNIQUE (arabic_username_a, arabic_username_b);
        
        RAISE NOTICE 'Created composite unique constraint on (arabic_username_a, arabic_username_b)';
    ELSE
        RAISE NOTICE 'Composite unique constraint on Arabic names already exists';
    END IF;
END $$;

-- Step 4: Check if composite unique constraint on English names already exists
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_attribute a1 ON a1.attrelid = c.conrelid AND a1.attnum = c.conkey[1]
        JOIN pg_attribute a2 ON a2.attrelid = c.conrelid AND a2.attnum = c.conkey[2]
        WHERE c.conrelid = 'public.userinfo'::regclass
          AND c.contype = 'u'
          AND array_length(c.conkey, 1) = 2
          AND a1.attname = 'english_username_a'
          AND a2.attname = 'english_username_b'
    ) INTO constraint_exists;

    IF NOT constraint_exists THEN
        -- Create composite unique constraint for English names
        ALTER TABLE public.userinfo
        ADD CONSTRAINT userinfo_english_name_unique 
        UNIQUE (english_username_a, english_username_b);
        
        RAISE NOTICE 'Created composite unique constraint on (english_username_a, english_username_b)';
    ELSE
        RAISE NOTICE 'Composite unique constraint on English names already exists';
    END IF;
END $$;

-- Step 5: Verify the constraints were created
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.userinfo'::regclass
  AND contype = 'u'
  AND (conname = 'userinfo_arabic_name_unique' OR conname = 'userinfo_english_name_unique')
ORDER BY conname;

-- =====================================================
-- NOTES:
-- =====================================================
-- This constraint allows multiple users with the same first name
-- as long as they have different father's names (second name).
-- This applies to BOTH Arabic and English names.
-- 
-- Example (English):
-- - User 1: First Name = "Judah", Second Name = "Osama" ✅
-- - User 2: First Name = "Judah", Second Name = "Ahmed" ✅ (Allowed - different father's name)
-- - User 3: First Name = "Judah", Second Name = "Osama" ❌ (Not allowed - same first + father's name)
-- 
-- Example (Arabic):
-- - User 1: First Name = "جودة", Second Name = "جودة" ✅
-- - User 2: First Name = "جودة", Second Name = "صاري" ✅ (Allowed - different father's name)
-- - User 3: First Name = "جودة", Second Name = "جودة" ❌ (Not allowed - same first + father's name)
-- =====================================================
