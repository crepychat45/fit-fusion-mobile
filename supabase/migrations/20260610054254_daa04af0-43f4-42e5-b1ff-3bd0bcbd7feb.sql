-- Prevent users from tampering with posts.likes_count directly
CREATE OR REPLACE FUNCTION public.prevent_likes_count_tamper()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Only allow likes_count to change when there is no authenticated user (i.e. trigger/service role context)
    IF NEW.likes_count IS DISTINCT FROM OLD.likes_count AND auth.uid() IS NOT NULL THEN
      NEW.likes_count := OLD.likes_count;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    -- Force new posts to start at 0; counter is maintained by the post_likes trigger
    NEW.likes_count := 0;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_protect_likes_count ON public.posts;
CREATE TRIGGER posts_protect_likes_count
BEFORE INSERT OR UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.prevent_likes_count_tamper();