
ALTER TABLE public.admin_messages
ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT false;
