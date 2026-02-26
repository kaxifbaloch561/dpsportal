CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id INTEGER NOT NULL,
  subject_id TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on chapters" ON public.chapters
  FOR SELECT USING (true);

CREATE UNIQUE INDEX chapters_class_subject_number_idx ON public.chapters (class_id, subject_id, chapter_number);