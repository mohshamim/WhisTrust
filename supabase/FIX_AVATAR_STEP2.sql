-- STEP 2: Add the new constraint with ALL avatar styles (RUN AFTER STEP 1)
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

-- After constraint is added, run Step 3 below:

