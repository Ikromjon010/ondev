
-- Add is_blocked and active_tier columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS active_tier text NOT NULL DEFAULT 'free';
