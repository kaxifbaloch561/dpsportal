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
  extracted_chapter_num integer;
BEGIN
  normalized_query := REGEXP_REPLACE(LOWER(p_query), '[^a-z0-9\s]', '', 'g');
  
  RETURN QUERY
  SELECT DISTINCT ON (qa.question)
    qa.question,
    qa.answer,
    COALESCE(ch.chapter_number, 
      CASE WHEN qa.chapter_id IS NOT NULL 
        THEN (REGEXP_REPLACE(qa.chapter_id, '[^0-9]', '', 'g'))::integer 
        ELSE 0 
      END
    ) as chapter_number,
    COALESCE(ch.chapter_title, 'General') as chapter_title,
    COALESCE(ex.exercise_type, 'Q&A') as exercise_type,
    COALESCE(ex.sort_order, 0) as question_number
  FROM chapter_qa qa
  LEFT JOIN chapters ch ON (
    ch.class_id = qa.class_id 
    AND ch.subject_id = qa.subject_id
    AND ch.chapter_number = (REGEXP_REPLACE(COALESCE(qa.chapter_id, '0'), '[^0-9]', '', 'g'))::integer
  )
  LEFT JOIN chapter_exercises ex ON (
    ex.class_id = qa.class_id 
    AND ex.subject_id = qa.subject_id 
    AND ex.chapter_number = COALESCE(ch.chapter_number, 0)
    AND REGEXP_REPLACE(LOWER(ex.question), '[^a-z0-9\s]', '', 'g') = REGEXP_REPLACE(LOWER(qa.question), '[^a-z0-9\s]', '', 'g')
  )
  WHERE qa.class_id = p_class_id
    AND qa.subject_id = p_subject_id
    AND (
      REGEXP_REPLACE(LOWER(qa.question), '[^a-z0-9\s]', '', 'g') LIKE '%' || normalized_query || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(qa.keywords) kw 
        WHERE LOWER(kw) LIKE '%' || normalized_query || '%'
      )
      OR qa.search_vector @@ plainto_tsquery('english', p_query)
    )
  ORDER BY qa.question, LENGTH(qa.question) ASC
  LIMIT p_limit;
END;
$$;