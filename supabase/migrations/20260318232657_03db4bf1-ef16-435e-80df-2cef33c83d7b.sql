
CREATE TABLE IF NOT EXISTS public.cultural_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('book', 'movie', 'game', 'music')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('currently', 'completed', 'want')),
  date_consumed DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  reflections TEXT,
  cover_url TEXT,
  author_creator TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.cultural_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries"
  ON public.cultural_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries"
  ON public.cultural_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON public.cultural_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON public.cultural_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_cultural_entries_updated_at
  BEFORE UPDATE ON public.cultural_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Users can upload covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their covers"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);
