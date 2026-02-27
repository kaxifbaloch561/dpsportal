
CREATE OR REPLACE FUNCTION public.search_chapter_qa(
  p_class_id INT,
  p_subject_id TEXT,
  p_query TEXT,
  p_limit INT DEFAULT 8
)
RETURNS TABLE(question TEXT, answer TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
  clean_query TEXT;
BEGIN
  -- Strip all non-alphanumeric characters (keep spaces) from user query
  clean_query := regexp_replace(lower(p_query), '[^a-z0-9\s]', '', 'g');
  clean_query := trim(clean_query);
  
  IF length(clean_query) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT cq.question, cq.answer
  FROM chapter_qa cq
  WHERE cq.class_id = p_class_id
    AND cq.subject_id = p_subject_id
    AND (
      -- Compare stripped versions
      regexp_replace(lower(cq.question), '[^a-z0-9\s]', '', 'g') ILIKE '%' || clean_query || '%'
      OR regexp_replace(lower(cq.answer), '[^a-z0-9\s]', '', 'g') ILIKE '%' || clean_query || '%'
    )
  LIMIT p_limit;
END;
$$;
