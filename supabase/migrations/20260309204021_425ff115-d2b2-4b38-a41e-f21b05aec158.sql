CREATE OR REPLACE FUNCTION public.search_chapter_qa(
  p_class_id integer,
  p_subject_id text,
  p_query text,
  p_limit integer DEFAULT 8
)
RETURNS TABLE(
  question text,
  answer text,
  chapter_number integer,
  chapter_title text,
  exercise_type text,
  question_number integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_query text;
BEGIN
  normalized_query := LOWER(TRIM(p_query));
  
  RETURN QUERY
  SELECT 
    ex.question,
    COALESCE(ex.answer, '') as answer,
    ex.chapter_number,
    COALESCE(ch.chapter_title, 'Chapter ' || ex.chapter_number) as chapter_title,
    ex.exercise_type,
    ex.sort_order as question_number
  FROM chapter_exercises ex
  LEFT JOIN chapters ch ON (
    ch.class_id = ex.class_id 
    AND ch.subject_id = ex.subject_id
    AND ch.chapter_number = ex.chapter_number
  )
  WHERE ex.class_id = p_class_id
    AND ex.subject_id = p_subject_id
    AND (
      LOWER(ex.question) LIKE '%' || normalized_query || '%'
      OR LOWER(COALESCE(ex.answer, '')) LIKE '%' || normalized_query || '%'
    )
  ORDER BY 
    ex.chapter_number ASC,
    ex.exercise_type ASC,
    ex.sort_order ASC
  LIMIT p_limit;
END;
$$;