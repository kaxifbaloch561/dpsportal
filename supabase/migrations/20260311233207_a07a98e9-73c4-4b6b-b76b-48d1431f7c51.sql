
-- Notifications table for tracking all notification events
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'announcement', 'account_status', 'discussion')),
  is_read BOOLEAN DEFAULT false,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Lesson plans table
CREATE TABLE public.lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_email TEXT NOT NULL,
  lesson_date DATE NOT NULL,
  period_number INTEGER NOT NULL CHECK (period_number >= 1 AND period_number <= 10),
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  notes TEXT,
  color TEXT DEFAULT 'hsl(235,78%,62%)',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies - open for now since auth is app-level
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on lesson_plans" ON public.lesson_plans FOR ALL USING (true) WITH CHECK (true);
