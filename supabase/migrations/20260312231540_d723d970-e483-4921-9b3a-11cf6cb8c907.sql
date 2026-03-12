
ALTER TABLE public.admin_messages DROP CONSTRAINT admin_messages_sender_type_check;
ALTER TABLE public.admin_messages ADD CONSTRAINT admin_messages_sender_type_check CHECK (sender_type = ANY (ARRAY['admin'::text, 'teacher'::text, 'principal'::text]));

ALTER TABLE public.discussion_messages DROP CONSTRAINT discussion_messages_sender_type_check;
ALTER TABLE public.discussion_messages ADD CONSTRAINT discussion_messages_sender_type_check CHECK (sender_type = ANY (ARRAY['admin'::text, 'teacher'::text, 'principal'::text]));

ALTER TABLE public.discussion_presence DROP CONSTRAINT discussion_presence_user_type_check;
ALTER TABLE public.discussion_presence ADD CONSTRAINT discussion_presence_user_type_check CHECK (user_type = ANY (ARRAY['admin'::text, 'teacher'::text, 'principal'::text]));
