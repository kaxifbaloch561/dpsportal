
CREATE TABLE public.announcement_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  teacher_email TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, teacher_email)
);

ALTER TABLE public.announcement_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert/update announcement views"
ON public.announcement_views FOR ALL
USING (true)
WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.announcement_views;
