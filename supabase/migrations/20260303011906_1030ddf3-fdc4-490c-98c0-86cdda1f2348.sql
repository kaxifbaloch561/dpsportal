-- Allow full CRUD for all users on chapters (admin-only enforced at app level)
CREATE POLICY "Allow insert on chapters" ON public.chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on chapters" ON public.chapters FOR UPDATE USING (true);
CREATE POLICY "Allow delete on chapters" ON public.chapters FOR DELETE USING (true);

-- Allow full CRUD for all users on chapter_exercises
CREATE POLICY "Allow insert on chapter_exercises" ON public.chapter_exercises FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on chapter_exercises" ON public.chapter_exercises FOR UPDATE USING (true);
CREATE POLICY "Allow delete on chapter_exercises" ON public.chapter_exercises FOR DELETE USING (true);
