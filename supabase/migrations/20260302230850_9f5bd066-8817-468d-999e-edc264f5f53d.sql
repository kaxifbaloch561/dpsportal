
-- Create teacher_requests table for feature requests, problem reports, suggestions
CREATE TABLE public.teacher_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('feature', 'problem', 'suggestion')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  teacher_email TEXT NOT NULL,
  admin_reply TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  replied_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.teacher_requests ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert (teachers submit requests)
CREATE POLICY "Anyone can insert requests"
ON public.teacher_requests
FOR INSERT
WITH CHECK (true);

-- Allow anon to select (admin reads, teachers see their own)
CREATE POLICY "Anyone can read requests"
ON public.teacher_requests
FOR SELECT
USING (true);

-- Allow anon to update (admin replies, marks as read)
CREATE POLICY "Anyone can update requests"
ON public.teacher_requests
FOR UPDATE
USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_requests;
