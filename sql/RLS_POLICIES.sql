-- -- Enable RLS and create policies for `album_keywords`
-- ALTER TABLE public.album_keywords ENABLE ROW LEVEL SECURITY;
--
-- -- Policy for SELECT (read access for everyone)
-- CREATE POLICY select_album_keywords ON public.album_keywords
--     FOR SELECT
--     USING (true);
--
-- -- Policy for INSERT (only allow insert if user_id matches auth.uid())
-- CREATE POLICY insert_album_keywords ON public.album_keywords
--     FOR INSERT
--     WITH CHECK (auth.uid() IS NOT NULL);
--
-- -- Enable RLS and create policies for `albums`
-- ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
--
-- -- Policy for SELECT
-- CREATE POLICY select_albums ON public.albums
--     FOR SELECT
--     USING (true);
--
-- -- Policy for INSERT
-- CREATE POLICY insert_albums ON public.albums
--     FOR INSERT
--     WITH CHECK (auth.uid() IS NOT NULL);
--
-- -- Enable RLS and create policies for `keyword_groups`
-- ALTER TABLE public.keyword_groups ENABLE ROW LEVEL SECURITY;
--
-- -- Policy for SELECT
-- CREATE POLICY select_keyword_groups ON public.keyword_groups
--     FOR SELECT
--     USING (true);
--
-- -- Policy for INSERT
-- CREATE POLICY insert_keyword_groups ON public.keyword_groups
--     FOR INSERT
--     WITH CHECK (auth.uid() IS NOT NULL);
--
-- -- Enable RLS and create policies for `keywords`
-- ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
--
-- -- Policy for SELECT
-- CREATE POLICY select_keywords ON public.keywords
--     FOR SELECT
--     USING (true);
--
-- -- Policy for INSERT
-- CREATE POLICY insert_keywords ON public.keywords
--     FOR INSERT
--     WITH CHECK (auth.uid() IS NOT NULL);
--
-- -- Enable RLS and create policies for `likes`
-- ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
--
-- -- Policy for SELECT
-- CREATE POLICY select_likes ON public.likes
--     FOR SELECT
--     USING (true);
--
-- -- Policy for INSERT
-- CREATE POLICY insert_likes ON public.likes
--     FOR INSERT
--     WITH CHECK (user_id = auth.uid());
--
-- -- Policy for DELETE
-- CREATE POLICY delete_likes ON public.likes
--     FOR DELETE
--     USING (user_id = auth.uid());
--
-- -- Enable RLS and create policies for `photo_keywords`
-- ALTER TABLE public.photo_keywords ENABLE ROW LEVEL SECURITY;
--
-- -- Policy for SELECT
-- CREATE POLICY select_photo_keywords ON public.photo_keywords
--     FOR SELECT
--     USING (true);
--
-- -- Policy for INSERT
-- CREATE POLICY insert_photo_keywords ON public.photo_keywords
--     FOR INSERT
--     WITH CHECK (auth.uid() IS NOT NULL);
--
-- -- Enable RLS and create policies for `photos`
-- ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
--
-- -- Policy for SELECT
-- CREATE POLICY select_photos ON public.photos
--     FOR SELECT
--     USING (true);
--
-- -- Policy for INSERT
-- CREATE POLICY insert_photos ON public.photos
--     FOR INSERT
--     WITH CHECK (auth.uid() IS NOT NULL);
--
--
--
-- CREATE POLICY create_likes ON likes
--     FOR INSERT
--     WITH CHECK (user_id = auth.uid());
-- CREATE POLICY delete_likes ON likes
--     FOR DELETE
-- USING (user_id = auth.uid());
--
--
--
--
