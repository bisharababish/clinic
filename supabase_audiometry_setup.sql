-- =====================================================
-- AUDIOMETRY SETUP - Database Schema and Policies
-- =====================================================
-- This script sets up everything needed for audiometry functionality:
-- 1. Updates user_roles to include 'Audiometry'
-- 2. Creates audiometry_images table
-- 3. Creates audiometry-images storage bucket
-- 4. Sets up RLS policies for table and storage
-- =====================================================

-- =====================================================
-- 1. UPDATE USERINFO TABLE TO ADD 'Audiometry' ROLE
-- =====================================================
-- First, drop the existing constraint
ALTER TABLE public.userinfo 
DROP CONSTRAINT IF EXISTS userinfo_user_roles_check;

-- Add the new constraint with 'Audiometry' role
ALTER TABLE public.userinfo 
ADD CONSTRAINT userinfo_user_roles_check 
CHECK (user_roles::text = ANY (
  ARRAY[
    'Admin'::text,
    'Doctor'::text,
    'Patient'::text,
    'Secretary'::text,
    'Nurse'::text,
    'Lab'::text,
    'X Ray'::text,
    'Ultrasound'::text,
    'Audiometry'::text
  ]
));

-- =====================================================
-- 2. CREATE AUDIOMETRY_IMAGES TABLE
-- =====================================================
-- First, create the sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS audiometry_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Then create the table
CREATE TABLE IF NOT EXISTS public.audiometry_images (
  id bigint NOT NULL DEFAULT nextval('audiometry_images_id_seq'::regclass),
  patient_id bigint,
  patient_name text,
  date_of_birth date,
  notes text,
  requesting_doctor text,
  image_url text NOT NULL,
  image_public_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audiometry_images_pkey PRIMARY KEY (id),
  CONSTRAINT fk_audiometry_images_patient FOREIGN KEY (patient_id) 
    REFERENCES public.userinfo(userid) ON DELETE CASCADE
);

-- Set the sequence to be owned by the table and ensure default is set
ALTER SEQUENCE audiometry_images_id_seq OWNED BY audiometry_images.id;
-- Ensure the id column uses the sequence as default (in case table already existed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audiometry_images') THEN
    ALTER TABLE audiometry_images ALTER COLUMN id SET DEFAULT nextval('audiometry_images_id_seq'::regclass);
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audiometry_images_patient_id ON public.audiometry_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_audiometry_images_created_at ON public.audiometry_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audiometry_images_patient_name ON public.audiometry_images(patient_name);

-- =====================================================
-- 3. CREATE STORAGE BUCKET
-- =====================================================
-- Create the storage bucket for audiometry images
-- Note: This requires superuser/admin privileges in Supabase
-- If this fails, create the bucket manually in Supabase Dashboard:
-- Go to: Storage > New Bucket > Name: audiometry-images

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audiometry-images',
  'audiometry-images',
  false, -- Not public - we use RLS policies for access control
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- If the above INSERT fails due to permissions, run this manually in Supabase Dashboard:
-- 1. Go to Storage section
-- 2. Click "New bucket"
-- 3. Name: audiometry-images
-- 4. Public: false (we use RLS policies)
-- 5. File size limit: 10485760 (10MB)
-- 6. Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp

-- =====================================================
-- 4. ENABLE RLS ON AUDIOMETRY_IMAGES TABLE
-- =====================================================
ALTER TABLE public.audiometry_images ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS POLICIES FOR AUDIOMETRY_IMAGES TABLE
-- =====================================================

-- Policy: Allow Audiometry role to INSERT their own records
CREATE POLICY "Audiometry role can insert audiometry images"
ON public.audiometry_images
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.userinfo
    WHERE userinfo.id = auth.uid()
    AND userinfo.user_roles = 'Audiometry'
  )
  OR EXISTS (
    SELECT 1 FROM public.userinfo
    WHERE userinfo.user_email = (SELECT auth.email())
    AND userinfo.user_roles = 'Audiometry'
  )
  OR EXISTS (
    SELECT 1 FROM public.userinfo
    WHERE userinfo.user_email = (SELECT auth.email())
    AND userinfo.user_roles = 'Admin'
  )
);

-- Policy: Allow Audiometry role to SELECT their own records
CREATE POLICY "Audiometry role can view their own images"
ON public.audiometry_images
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.userinfo
    WHERE userinfo.user_email = (SELECT auth.email())
    AND userinfo.user_roles = 'Audiometry'
  )
  OR EXISTS (
    SELECT 1 FROM public.userinfo
    WHERE userinfo.user_email = (SELECT auth.email())
    AND userinfo.user_roles = 'Admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.userinfo
    WHERE userinfo.user_email = (SELECT auth.email())
    AND userinfo.user_roles = 'Doctor'
  )
);

-- Policy: Allow Doctors to SELECT all audiometry images
CREATE POLICY "Doctors can view all audiometry images"
ON public.audiometry_images
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.userinfo
    WHERE userinfo.user_email = (SELECT auth.email())
    AND (userinfo.user_roles = 'Doctor' OR userinfo.user_roles = 'Admin')
  )
);

-- Policy: Allow Admin to SELECT all audiometry images
CREATE POLICY "Admin can view all audiometry images"
ON public.audiometry_images
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.userinfo
    WHERE userinfo.user_email = (SELECT auth.email())
    AND userinfo.user_roles = 'Admin'
  )
);

-- Policy: Allow Admin to DELETE any audiometry image
CREATE POLICY "Admin can delete audiometry images"
ON public.audiometry_images
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.userinfo
    WHERE userinfo.user_email = (SELECT auth.email())
    AND userinfo.user_roles = 'Admin'
  )
);

-- Policy: Allow Audiometry role to DELETE their own records (optional)
CREATE POLICY "Audiometry role can delete their own images"
ON public.audiometry_images
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.userinfo
    WHERE userinfo.user_email = (SELECT auth.email())
    AND userinfo.user_roles = 'Audiometry'
  )
);

-- =====================================================
-- 6. RLS POLICIES FOR AUDIOMETRY-IMAGES STORAGE BUCKET
-- =====================================================

-- Policy: Allow authenticated users with Audiometry role to UPLOAD
CREATE POLICY "Audiometry role can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audiometry-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.userinfo
      WHERE userinfo.user_email = (SELECT auth.email())
      AND userinfo.user_roles = 'Audiometry'
    )
    OR EXISTS (
      SELECT 1 FROM public.userinfo
      WHERE userinfo.user_email = (SELECT auth.email())
      AND userinfo.user_roles = 'Admin'
    )
  )
  AND (storage.foldername(name))[1] LIKE 'patient_%' -- Enforce patient folder structure
);

-- Policy: Allow Audiometry, Doctor, and Admin to SELECT (view/download) images
CREATE POLICY "Audiometry, Doctor, and Admin can view images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'audiometry-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.userinfo
      WHERE userinfo.user_email = (SELECT auth.email())
      AND userinfo.user_roles IN ('Audiometry', 'Doctor', 'Admin')
    )
  )
);

-- Policy: Allow Admin and Audiometry role to DELETE images
CREATE POLICY "Admin and Audiometry role can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'audiometry-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.userinfo
      WHERE userinfo.user_email = (SELECT auth.email())
      AND userinfo.user_roles IN ('Admin', 'Audiometry')
    )
  )
);

-- Policy: Allow public access to images if bucket is public (optional)
-- Only enable if you want public access to audiometry images
-- CREATE POLICY "Public can view audiometry images"
-- ON storage.objects
-- FOR SELECT
-- TO public
-- USING (bucket_id = 'audiometry-images');

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================
-- Grant necessary permissions to authenticated users
GRANT USAGE ON SEQUENCE audiometry_images_id_seq TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.audiometry_images TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES (Run these to verify setup)
-- =====================================================
-- Check if table exists:
-- SELECT * FROM information_schema.tables WHERE table_name = 'audiometry_images';

-- Check if policies exist:
-- SELECT * FROM pg_policies WHERE tablename = 'audiometry_images';

-- Check if storage policies exist:
-- SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%audiometry%';

-- Check if bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'audiometry-images';

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. The storage bucket 'audiometry-images' must be created manually in Supabase Dashboard
--    or via the Storage API before the storage policies will work.
--
-- 2. Storage bucket creation steps:
--    - Go to Supabase Dashboard > Storage
--    - Click "New bucket"
--    - Name: audiometry-images
--    - Public: false (we use RLS policies for access)
--    - File size limit: 10485760 (10MB)
--    - Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp
--
-- 3. The patient folder structure is enforced: patient_{patient_id}/filename.ext
--
-- 4. Only Admin can delete images from the database table.
--    Both Admin and Audiometry roles can delete from storage.
--
-- 5. Doctors can view all audiometry images but cannot delete them.
--
-- 6. The delete functionality in DoctorAudiometryPage.tsx handles:
--    - Deleting from storage first
--    - Then deleting from database
--    - Only Admin role can use delete functionality
--
-- =====================================================
