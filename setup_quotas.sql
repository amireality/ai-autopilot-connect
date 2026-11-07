-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  available_quota INTEGER DEFAULT 5 NOT NULL,
  tier TEXT DEFAULT 'free' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Safe to run multiple times)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile (Drop first to avoid exists error)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Create a trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, available_quota, tier)
  VALUES (new.id, 5, 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Give 5 free posts to all EXISTING users
INSERT INTO public.profiles (id, available_quota, tier)
SELECT id, 5, 'free' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Create function to decrement quota safely and return remaining quota
CREATE OR REPLACE FUNCTION decrement_quota(target_user_id UUID)
RETURNS integer AS $$
DECLARE
  new_quota integer;
BEGIN
  UPDATE public.profiles
  SET 
    available_quota = GREATEST(available_quota - 1, 0),
    updated_at = NOW()
  WHERE id = target_user_id
  RETURNING available_quota INTO new_quota;
  
  RETURN COALESCE(new_quota, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to add subscription quota safely (called by n8n upon payment)
CREATE OR REPLACE FUNCTION add_subscription_quota(target_user_id UUID, quota_to_add INTEGER, new_tier TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    available_quota = available_quota + quota_to_add,
    tier = new_tier,
    updated_at = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
