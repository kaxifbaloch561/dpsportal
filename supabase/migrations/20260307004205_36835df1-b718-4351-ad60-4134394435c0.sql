
-- Classes table
CREATE TABLE public.classes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subjects table
CREATE TABLE public.subjects (
  id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  class_id INTEGER NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, class_id)
);

-- RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Anyone can read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Anyone can read subjects" ON public.subjects FOR SELECT USING (true);

-- Allow all inserts/updates/deletes (admin auth at app level)
CREATE POLICY "Allow all insert classes" ON public.classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update classes" ON public.classes FOR UPDATE USING (true);
CREATE POLICY "Allow all delete classes" ON public.classes FOR DELETE USING (true);

CREATE POLICY "Allow all insert subjects" ON public.subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update subjects" ON public.subjects FOR UPDATE USING (true);
CREATE POLICY "Allow all delete subjects" ON public.subjects FOR DELETE USING (true);
