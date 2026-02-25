
CREATE TABLE public.chapter_qa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id INTEGER NOT NULL,
  subject_id TEXT NOT NULL,
  chapter_id TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_chapter_qa_search ON public.chapter_qa USING GIN (search_vector);
CREATE INDEX idx_chapter_qa_class_subject ON public.chapter_qa (class_id, subject_id);

ALTER TABLE public.chapter_qa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read Q&A" ON public.chapter_qa FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION update_qa_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.question || ' ' || COALESCE(array_to_string(NEW.keywords, ' '), ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_qa_search_vector
  BEFORE INSERT OR UPDATE ON public.chapter_qa
  FOR EACH ROW EXECUTE FUNCTION update_qa_search_vector();
