
-- Create discussion_messages table (if not exists)
CREATE TABLE IF NOT EXISTS public.discussion_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'teacher')),
  message TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'file', 'image')),
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  reply_to_id UUID,
  reply_to_name TEXT,
  reply_to_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Self-reference FK
ALTER TABLE public.discussion_messages ADD CONSTRAINT discussion_messages_reply_fk FOREIGN KEY (reply_to_id) REFERENCES public.discussion_messages(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE public.discussion_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disc_select" ON public.discussion_messages FOR SELECT USING (true);
CREATE POLICY "disc_insert" ON public.discussion_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "disc_delete" ON public.discussion_messages FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_messages;

-- Online presence table
CREATE TABLE public.discussion_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'teacher')),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.discussion_presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "presence_select" ON public.discussion_presence FOR SELECT USING (true);
CREATE POLICY "presence_insert" ON public.discussion_presence FOR INSERT WITH CHECK (true);
CREATE POLICY "presence_update" ON public.discussion_presence FOR UPDATE USING (true);
CREATE POLICY "presence_delete" ON public.discussion_presence FOR DELETE USING (true);
