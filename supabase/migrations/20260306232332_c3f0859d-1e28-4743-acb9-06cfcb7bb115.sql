
CREATE TABLE public.teacher_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  class_teacher TEXT,
  avatar_url TEXT,
  avatar_type TEXT DEFAULT 'avatar',
  subjects TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Allow public read/insert for registration, admin manages via app-level auth
ALTER TABLE public.teacher_accounts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (registration)
CREATE POLICY "Anyone can register" ON public.teacher_accounts
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read (for login checks)
CREATE POLICY "Anyone can read teacher accounts" ON public.teacher_accounts
  FOR SELECT USING (true);

-- Allow anyone to update (admin updates via app-level auth)
CREATE POLICY "Anyone can update teacher accounts" ON public.teacher_accounts
  FOR UPDATE USING (true);

-- Allow anyone to delete (admin removes via app-level auth)
CREATE POLICY "Anyone can delete teacher accounts" ON public.teacher_accounts
  FOR DELETE USING (true);
