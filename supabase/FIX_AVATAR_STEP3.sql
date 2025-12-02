-- STEP 3: Update existing users to use 'profile' as default (RUN AFTER STEP 2)
UPDATE admin_profiles 
SET avatar_style = 'profile'
WHERE avatar_style IS NULL 
  OR avatar_style NOT IN ('profile', 'man', 'man-1', 'man-2', 'man-3', 'boy', 'arab-man', 'arab-man-1', 'woman', 'woman-1', 'moslem-woman', 'arab');

-- Verify the update
SELECT id, email, avatar_style, avatar_url 
FROM admin_profiles
ORDER BY created_at;

