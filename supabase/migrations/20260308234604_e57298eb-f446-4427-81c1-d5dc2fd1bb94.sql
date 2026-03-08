-- Drop the existing function
DROP FUNCTION IF EXISTS public.search_chapter_qa(integer, text, text, integer);

-- Create enhanced version that returns chapter and exercise metadata
CREATE OR REPLACE FUNCTION public.search_chapter_qa(
  p_class_id integer,
  p_subject_id text,
  p_query text,
  p_limit integer DEFAULT 8
)
RETURNS TABLE (
  question text,
  answer text,
  chapter_number integer,
  chapter_title text,
  exercise_type text,
  question_number integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (qa.question)
    qa.question,
    qa.answer,
    COALESCE(ch.chapter_number, 0) as chapter_number,
    COALESCE(ch.chapter_title, 'General') as chapter_title,
    COALESCE(ex.exercise_type, 'Q&A') as exercise_type,
    COALESCE(ex.sort_order, 0) as question_number
  FROM chapter_qa qa
  LEFT JOIN chapters ch ON qa.chapter_id = ch.id
  LEFT JOIN chapter_exercises ex ON (
    ex.class_id = qa.class_id 
    AND ex.subject_id = qa.subject_id 
    AND ex.chapter_number = ch.chapter_number
    AND REGEXP_REPLACE(LOWER(ex.question), '[^a-z0-9\s]', '', 'g') = REGEXP_REPLACE(LOWER(qa.question), '[^a-z0-9\s]', '', 'g')
  )
  WHERE qa.class_id = p_class_id
    AND qa.subject_id = p_subject_id
    AND REGEXP_REPLACE(LOWER(qa.question), '[^a-z0-9\s]', '', 'g') LIKE 
        '%' || REGEXP_REPLACE(LOWER(p_query), '[^a-z0-9\s]', '', 'g') || '%'
  ORDER BY qa.question, LENGTH(qa.question) ASC
  LIMIT p_limit;
END;
$$;