-- Add recurring_interval column to expenses table
ALTER TABLE public.expenses 
ADD COLUMN recurring_interval text DEFAULT 'none';

-- Update profiles table to add avatar_url and currency columns if they don't exist
-- (This is safe to run even if columns exist)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';