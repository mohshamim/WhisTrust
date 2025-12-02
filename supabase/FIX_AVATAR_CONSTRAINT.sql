-- Fix Avatar Style Constraint
-- Run this to fix the CHECK constraint and update existing users

-- Drop the old constraint
ALTER TABLE admin_profiles
DROP CONSTRAINT IF EXISTS valid_avatar_style;

-- Add the correct constraint with ALL avatar styles
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

-- Now update existing users to use 'profile' as default
UPDATE admin_profiles 
SET avatar_style = 'profile'
WHERE avatar_style IS NULL 
  OR avatar_style NOT IN ('profile', 'man', 'man-1', 'man-2', 'man-3', 'boy', 'arab-man', 'arab-man-1', 'woman', 'woman-1', 'moslem-woman', 'arab');

-- Verify the update
SELECT id, email, avatar_style, avatar_url 
FROM admin_profiles
ORDER BY created_at;

