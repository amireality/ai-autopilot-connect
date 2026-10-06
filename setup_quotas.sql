-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  available_quota INTEGER DEFAULT 5 NOT NULL,
  tier TEXT DEFAULT 'free' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Give 5 free posts to all EXISTING users
INSERT INTO public.profiles (id, available_quota, tier)
SELECT id, 5, 'free' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Create function to decrement quota safely
CREATE OR REPLACE FUNCTION decrement_quota(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET available_quota = available_quota - 1
  WHERE id = user_id AND available_quota > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
