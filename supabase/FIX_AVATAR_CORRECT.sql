-- Complete Avatar Fix Script
-- Run this entire script at once

-- STEP 1: Drop the old constraint
ALTER TABLE admin_profiles
DROP CONSTRAINT IF EXISTS valid_avatar_style;

-- STEP 2: Update existing users FIRST (before adding new constraint)
-- This fixes any old Dicebear style names to our new 'profile' default
UPDATE admin_profiles 
SET avatar_style = 'profile'
WHERE avatar_style IS NULL 
  OR avatar_style NOT IN ('profile', 'man', 'man-1', 'man-2', 'man-3', 'boy', 'arab-man', 'arab-man-1', 'woman', 'woman-1', 'moslem-woman', 'arab');

-- STEP 3: Now add the new constraint (after data is clean)
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

-- Verify the update
SELECT id, email, avatar_style, avatar_url 
FROM admin_profiles
ORDER BY created_at;

