-- Update audiometry_images table for Hearing Exam ABR results
-- Since we're no longer uploading images, we need to:
-- 1. Make image_url nullable
-- 2. Add columns to store exam results (passed/failed for each ear)

-- Make image_url nullable
ALTER TABLE public.audiometry_images 
ALTER COLUMN image_url DROP NOT NULL;

-- Add columns for Hearing Exam ABR results
ALTER TABLE public.audiometry_images 
ADD COLUMN IF NOT EXISTS left_ear_result text CHECK (left_ear_result IS NULL OR left_ear_result IN ('passed', 'failed')),
ADD COLUMN IF NOT EXISTS right_ear_result text CHECK (right_ear_result IS NULL OR right_ear_result IN ('passed', 'failed'));

-- Add comments to document the changes
COMMENT ON COLUMN public.audiometry_images.image_url IS 
'Image URL is now optional. For Hearing Exam ABR results, this field may be NULL.';

COMMENT ON COLUMN public.audiometry_images.left_ear_result IS 
'Result for left ear: "passed" or "failed"';

COMMENT ON COLUMN public.audiometry_images.right_ear_result IS 
'Result for right ear: "passed" or "failed"';

