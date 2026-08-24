CREATE TYPE public.social_platform AS ENUM ('x', 'linkedin');
CREATE TYPE public.connection_status AS ENUM ('not_connected', 'pending', 'connected', 'error');
CREATE TYPE public.publish_status AS ENUM ('queued', 'publishing', 'published', 'failed');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  platform public.social_platform NOT NULL,
  status public.connection_status NOT NULL DEFAULT 'pending',
  account_handle TEXT,
  token_ciphertext TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_connections TO authenticated;
GRANT ALL ON public.social_connections TO service_role;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own social connections"
ON public.social_connections FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_social_connections_updated_at
BEFORE UPDATE ON public.social_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.publishing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  platform public.social_platform NOT NULL,
  post_content TEXT NOT NULL,
  status public.publish_status NOT NULL DEFAULT 'queued',
  external_post_id TEXT,
  last_error TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.publishing_queue TO authenticated;
GRANT ALL ON public.publishing_queue TO service_role;
ALTER TABLE public.publishing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own queued posts"
ON public.publishing_queue FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_publishing_queue_updated_at
BEFORE UPDATE ON public.publishing_queue
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX publishing_queue_status_created_idx ON public.publishing_queue (status, created_at);
CREATE INDEX publishing_queue_user_idx ON public.publishing_queue (user_id);