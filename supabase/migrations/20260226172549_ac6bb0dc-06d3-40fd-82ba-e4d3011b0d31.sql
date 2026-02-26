CREATE TABLE public.chapter_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id INTEGER NOT NULL,
  subject_id TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('qa', 'mcq')),
  question TEXT NOT NULL,
  answer TEXT,
  options JSONB,
  correct_option TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chapter_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on chapter_exercises" ON public.chapter_exercises
  FOR SELECT USING (true);

CREATE INDEX chapter_exercises_lookup_idx ON public.chapter_exercises (class_id, subject_id, chapter_number);