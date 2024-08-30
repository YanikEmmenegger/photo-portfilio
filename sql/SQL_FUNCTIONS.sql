-- CREATE OR REPLACE FUNCTION get_photos_from(
--     filter_type TEXT DEFAULT 'all',          -- Type of filter ('random', 'by_id', 'background', 'keywords_or', 'keywords_and', 'all')
--     keywords TEXT[] DEFAULT NULL,            -- Array of keywords to search for (if applicable)
--     photo_ids INT[] DEFAULT NULL,            -- Array of photo IDs to fetch (if applicable)
--     limit_count INT DEFAULT 30,              -- Number of photos to return
--     offset_count INT DEFAULT 0,              -- Offset for pagination
--     sort_order TEXT DEFAULT 'DESC'           -- Sort order ('ASC' or 'DESC')
-- )
-- RETURNS TABLE(
--     photo_id INT,
--     filename TEXT,
--     extension TEXT,
--     width INT,
--     height INT,
--     latitude NUMERIC(9, 6),
--     longitude NUMERIC(9, 6),
--     description TEXT,
--     title TEXT,
--     keyword_list TEXT[],
--     like_count INT,
--     capture_date TIMESTAMP WITH TIME ZONE
-- ) AS $$
-- DECLARE
-- query TEXT;
-- BEGIN
--     -- Construct the query based on filter_type
--     IF filter_type = 'random' THEN
--         query := '
--             SELECT
--                 p.photo_id::INT,
--                 p.filename::TEXT,
--                 p.extension::TEXT,
--                 p.width::INT,
--                 p.height::INT,
--                 p.latitude::NUMERIC,
--                 p.longitude::NUMERIC,
--                 p.description::TEXT,
--                 p.title::TEXT,
--                 ARRAY_AGG(DISTINCT k.keyword::TEXT) AS keyword_list,
--                 COALESCE(l.like_count::INT, 0) AS like_count,
--                 p.capture_date
--             FROM photos p
--             LEFT JOIN photo_keywords pk ON p.photo_id = pk.photo_id
--             LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
--             LEFT JOIN (
--                 SELECT photo_id, COUNT(*)::INT AS like_count
--                 FROM likes
--                 GROUP BY photo_id
--             ) l ON p.photo_id = l.photo_id
--             GROUP BY p.photo_id, l.like_count
--             ORDER BY RANDOM()
--             LIMIT $1
--             OFFSET $2';
--
-- RETURN QUERY EXECUTE query USING limit_count, offset_count;
--
-- ELSIF filter_type = 'by_id' THEN
--         query := '
--             SELECT
--                 p.photo_id::INT,
--                 p.filename::TEXT,
--                 p.extension::TEXT,
--                 p.width::INT,
--                 p.height::INT,
--                 p.latitude::NUMERIC,
--                 p.longitude::NUMERIC,
--                 p.description::TEXT,
--                 p.title::TEXT,
--                 ARRAY_AGG(DISTINCT k.keyword::TEXT) AS keyword_list,
--                 COALESCE(l.like_count::INT, 0) AS like_count,
--                 p.capture_date
--             FROM photos p
--             LEFT JOIN photo_keywords pk ON p.photo_id = pk.photo_id
--             LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
--             LEFT JOIN (
--                 SELECT photo_id, COUNT(*)::INT AS like_count
--                 FROM likes
--                 GROUP BY photo_id
--             ) l ON p.photo_id = l.photo_id
--             WHERE p.photo_id = ANY($1)
--             GROUP BY p.photo_id, l.like_count
--             ORDER BY p.capture_date ' || sort_order || '
--             LIMIT $2
--             OFFSET $3';
--
-- RETURN QUERY EXECUTE query USING photo_ids, limit_count, offset_count;
--
-- ELSIF filter_type = 'background' THEN
--         query := '
--             SELECT
--                 p.photo_id::INT,
--                 p.filename::TEXT,
--                 p.extension::TEXT,
--                 p.width::INT,
--                 p.height::INT,
--                 p.latitude::NUMERIC,
--                 p.longitude::NUMERIC,
--                 p.description::TEXT,
--                 p.title::TEXT,
--                 ARRAY_AGG(DISTINCT k.keyword::TEXT) AS keyword_list,
--                 COALESCE(l.like_count::INT, 0) AS like_count,
--                 p.capture_date
--             FROM photos p
--             LEFT JOIN photo_keywords pk ON p.photo_id = pk.photo_id
--             LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
--             LEFT JOIN (
--                 SELECT photo_id, COUNT(*)::INT AS like_count
--                 FROM likes
--                 GROUP BY photo_id
--             ) l ON p.photo_id = l.photo_id
--             WHERE p.width > p.height
--             GROUP BY p.photo_id, l.like_count
--             ORDER BY RANDOM()
--             LIMIT $1
--             OFFSET $2';
--
-- RETURN QUERY EXECUTE query USING limit_count, offset_count;
--
-- ELSIF filter_type = 'keywords_or' THEN
--         query := '
--             SELECT
--                 p.photo_id::INT,
--                 p.filename::TEXT,
--                 p.extension::TEXT,
--                 p.width::INT,
--                 p.height::INT,
--                 p.latitude::NUMERIC,
--                 p.longitude::NUMERIC,
--                 p.description::TEXT,
--                 p.title::TEXT,
--                 ARRAY_AGG(DISTINCT k.keyword::TEXT) AS keyword_list,
--                 COALESCE(l.like_count::INT, 0) AS like_count,
--                 p.capture_date
--             FROM photos p
--             LEFT JOIN photo_keywords pk ON p.photo_id = pk.photo_id
--             LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
--             LEFT JOIN (
--                 SELECT photo_id, COUNT(*)::INT AS like_count
--                 FROM likes
--                 GROUP BY photo_id
--             ) l ON p.photo_id = l.photo_id
--             WHERE k.keyword = ANY($1)
--             GROUP BY p.photo_id, l.like_count
--             ORDER BY p.capture_date ' || sort_order || '
--             LIMIT $2
--             OFFSET $3';
--
-- RETURN QUERY EXECUTE query USING keywords, limit_count, offset_count;
--
-- ELSIF filter_type = 'keywords_and' THEN
--         query := '
--             SELECT
--                 p.photo_id::INT,
--                 p.filename::TEXT,
--                 p.extension::TEXT,
--                 p.width::INT,
--                 p.height::INT,
--                 p.latitude::NUMERIC,
--                 p.longitude::NUMERIC,
--                 p.description::TEXT,
--                 p.title::TEXT,
--                 ARRAY_AGG(DISTINCT k.keyword::TEXT) AS keyword_list,
--                 COALESCE(l.like_count::INT, 0) AS like_count,
--                 p.capture_date
--             FROM photos p
--             LEFT JOIN photo_keywords pk ON p.photo_id = pk.photo_id
--             LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
--             LEFT JOIN (
--                 SELECT photo_id, COUNT(*)::INT AS like_count
--                 FROM likes
--                 GROUP BY photo_id
--             ) l ON p.photo_id = l.photo_id
--             WHERE p.photo_id IN (
--                 SELECT p2.photo_id
--                 FROM photos p2
--                 LEFT JOIN photo_keywords pk2 ON p2.photo_id = pk2.photo_id
--                 LEFT JOIN keywords k2 ON pk2.keyword_id = k2.keyword_id
--                 WHERE k2.keyword IN (SELECT UNNEST($1))
--                 GROUP BY p2.photo_id
--                 HAVING COUNT(DISTINCT k2.keyword) = ARRAY_LENGTH($1, 1)
--             )
--             GROUP BY p.photo_id, l.like_count
--             ORDER BY p.capture_date ' || sort_order || '
--             LIMIT $2
--             OFFSET $3';
--
-- RETURN QUERY EXECUTE query USING keywords, limit_count, offset_count;
--
-- ELSIF filter_type = 'all' THEN
--         query := '
--             SELECT
--                 p.photo_id::INT,
--                 p.filename::TEXT,
--                 p.extension::TEXT,
--                 p.width::INT,
--                 p.height::INT,
--                 p.latitude::NUMERIC,
--                 p.longitude::NUMERIC,
--                 p.description::TEXT,
--                 p.title::TEXT,
--                 ARRAY_AGG(DISTINCT k.keyword::TEXT) AS keyword_list,
--                 COALESCE(l.like_count::INT, 0) AS like_count,
--                 p.capture_date
--             FROM photos p
--             LEFT JOIN photo_keywords pk ON p.photo_id = pk.photo_id
--             LEFT JOIN keywords k ON pk.keyword_id = k.keyword_id
--             LEFT JOIN (
--                 SELECT photo_id, COUNT(*)::INT AS like_count
--                 FROM likes
--                 GROUP BY photo_id
--             ) l ON p.photo_id = l.photo_id
--             GROUP BY p.photo_id, l.like_count
--             ORDER BY p.capture_date ' || sort_order || '
--             LIMIT $1
--             OFFSET $2';
--
-- RETURN QUERY EXECUTE query USING limit_count, offset_count;
--
-- ELSE
--         RAISE EXCEPTION 'Invalid filter_type: %', filter_type;
-- END IF;
-- END;
-- $$ LANGUAGE plpgsql;
--
--
--    CREATE OR REPLACE FUNCTION get_album_with_photos(
--     p_album_id INT
-- )
-- RETURNS TABLE(
--     album_id INT,
--     album_name VARCHAR(255),
--     description TEXT,
--     cover_photo_id INT,
--     photos JSONB  -- JSONB type to store the photos information
-- ) AS $$
-- BEGIN
-- RETURN QUERY
--     WITH album_info AS (
--         SELECT
--             a.album_id,
--             a.album_name,
--             a.description,
--             a.cover_photo_id,
--             ARRAY_AGG(DISTINCT k.keyword) AS album_keywords
--         FROM albums a
--         LEFT JOIN album_keywords ak ON a.album_id = ak.album_id
--         LEFT JOIN keywords k ON ak.keyword_id = k.keyword_id
--         WHERE a.album_id = p_album_id
--         GROUP BY a.album_id
--     ),
--     photo_data AS (
--         SELECT
--             p.photo_id,
--             p.filename,
--             p.extension,
--             p.width,
--             p.height,
--             p.latitude,
--             p.longitude,
--             p.description AS photo_description,
--             p.title,
--             p.keyword_list,
--             p.like_count,
--             p.capture_date
--         FROM album_info ai
--         LEFT JOIN LATERAL get_photos(
--             'keywords_or',
--             ai.album_keywords,  -- Pass the album's keywords to the get_photos function
--             NULL,
--             2000000,
--             0,
--             'DESC'
--         ) p ON TRUE
--     )
-- SELECT
--     ai.album_id,
--     ai.album_name,
--     ai.description,
--     ai.cover_photo_id,
--     jsonb_agg(
--             jsonb_build_object(
--                     'photo_id', p.photo_id,
--                     'filename', p.filename,
--                     'extension', p.extension,
--                     'width', p.width,
--                     'height', p.height,
--                     'latitude', p.latitude,
--                     'longitude', p.longitude,
--                     'description', p.photo_description,
--                     'title', p.title,
--                     'keywords', p.keyword_list,
--                     'like_count', p.like_count,
--                     'capture_date', p.capture_date
--             )
--     ) AS photos
-- FROM album_info ai
--          LEFT JOIN photo_data p ON ai.album_id = ai.album_id
-- GROUP BY ai.album_id, ai.album_name, ai.description, ai.cover_photo_id;
-- END;
-- $$ LANGUAGE plpgsql;