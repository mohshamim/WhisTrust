-- Migration: Add avatar_style column to admin_profiles
-- Allow users to save their preferred avatar style from local professional images

-- Add avatar_style column (nullable, defaults to 'profile')
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS avatar_style TEXT;

-- Add a check constraint for valid avatar styles (updated for local avatars)
ALTER TABLE admin_profiles
DROP CONSTRAINT IF EXISTS valid_avatar_style;

ALTER TABLE admin_profiles
ADD CONSTRAINT valid_avatar_style 
CHECK (avatar_style IS NULL OR avatar_style IN (
  'profile',
  'man',
  'man-1',
  'man-2',
  'man-3',
  'boy',
  'arab-man',
  'arab-man-1',
  'woman',
  'woman-1',
  'moslem-woman',
  'arab'
));

-- Set default avatar style for existing users without one
UPDATE admin_profiles 
SET avatar_style = 'profile'
WHERE avatar_style IS NULL 
  OR avatar_style NOT IN ('profile', 'man', 'man-1', 'man-2', 'man-3', 'boy', 'arab-man', 'arab-man-1', 'woman', 'woman-1', 'moslem-woman', 'arab');

-- Remove old trigger and function (no longer needed as we use local images)
DROP TRIGGER IF EXISTS set_default_avatar_trigger ON admin_profiles;
DROP FUNCTION IF EXISTS set_default_avatar();

