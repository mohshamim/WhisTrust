-- Migration: Add avatar_style column to admin_profiles
-- Allow users to save their preferred Dicebear avatar style

-- Add avatar_style column (nullable, defaults to 'avataaars')
ALTER TABLE admin_profiles 
ADD COLUMN IF NOT EXISTS avatar_style TEXT;

-- Add a check constraint for valid avatar styles
ALTER TABLE admin_profiles
ADD CONSTRAINT valid_avatar_style 
CHECK (avatar_style IS NULL OR avatar_style IN (
  'notionists',
  'avataaars',
  'lorelei',
  'big-smile',
  'personas',
  'adventurer',
  'initials',
  'shapes'
));

-- Set default avatar style for existing users without one
UPDATE admin_profiles 
SET avatar_style = 'notionists'
WHERE avatar_style IS NULL 
  AND (avatar_url IS NULL OR avatar_url LIKE '%dicebear.com%');

-- Create a function to set default avatar on user creation
CREATE OR REPLACE FUNCTION set_default_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- If no avatar_url provided, generate default Dicebear avatar (Professional style)
  IF NEW.avatar_url IS NULL THEN
    NEW.avatar_style := COALESCE(NEW.avatar_style, 'notionists');
    NEW.avatar_url := 'https://api.dicebear.com/7.x/' || NEW.avatar_style || '/svg?seed=' || encode(NEW.email::bytea, 'escape');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign default avatar on insert
DROP TRIGGER IF EXISTS set_default_avatar_trigger ON admin_profiles;
CREATE TRIGGER set_default_avatar_trigger
  BEFORE INSERT ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_default_avatar();

