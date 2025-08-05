-- SQL for 'specs' Table
-- Stores all the community-submitted specifications.

CREATE TABLE public.specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  language TEXT,
  project_type TEXT,
  tags TEXT[],
  rating NUMERIC(2, 1) DEFAULT 0.0,
  total_ratings INT DEFAULT 0,
  version TEXT,
  github_url TEXT UNIQUE,
  toml_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.specs ENABLE ROW LEVEL SECURITY;

-- Policies for specs
CREATE POLICY "Specs are viewable by everyone."
  ON public.specs FOR SELECT
  USING ( true );

CREATE POLICY "Authenticated users can insert specs."
  ON public.specs FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own specs."
  ON public.specs FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own specs."
  ON public.specs FOR DELETE
  USING ( auth.uid() = user_id );
