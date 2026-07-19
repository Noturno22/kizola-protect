-- Migration: Add nationality column to profiles table
-- Date: 2026-07-18

-- Add nationality column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nationality TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_nationality ON profiles(nationality);

-- Add comment to column
COMMENT ON COLUMN profiles.nationality IS 'User nationality/country of origin';
