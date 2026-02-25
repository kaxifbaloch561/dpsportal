
CREATE OR REPLACE FUNCTION update_qa_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.question || ' ' || COALESCE(array_to_string(NEW.keywords, ' '), ''));
  RETURN NEW;
END;
$$;
