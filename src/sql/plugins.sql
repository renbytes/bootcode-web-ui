-- SQL for 'plugins' Table
-- This table stores community-submitted plugins for the Spex ecosystem.

CREATE TABLE public.plugins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT, -- e.g., 'rust', 'python'
  version TEXT,
  github_url TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.plugins ENABLE ROW LEVEL SECURITY;

-- Policies for plugins
CREATE POLICY "Plugins are viewable by everyone."
  ON public.plugins FOR SELECT
  USING ( true );

CREATE POLICY "Authenticated users can insert plugins."
  ON public.plugins FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own plugins."
  ON public.plugins FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own plugins."
  ON public.plugins FOR DELETE
  USING ( auth.uid() = user_id );
