import psycopg2


def connect_db():
    from env_setup import DB_HOST, DB_NAME, DB_USER, DB_PORT, DB_PASSWORD
    return psycopg2.connect(
        host=DB_HOST,
        dbname=DB_NAME,
        user=DB_USER,
        port=DB_PORT,
        password=DB_PASSWORD
    )


def insert_or_get_keyword_id(conn, keyword):
    with conn.cursor() as cursor:
        cursor.execute("SELECT keyword_id FROM keywords WHERE keyword = %s;", (keyword,))
        result = cursor.fetchone()
        if result:
            return result[0]
        else:
            cursor.execute("INSERT INTO keywords (keyword) VALUES (%s) RETURNING keyword_id;", (keyword,))
            keyword_id = cursor.fetchone()[0]
            conn.commit()
            return keyword_id


def insert_photo_keywords(conn, photo_id, keywords):
    with conn.cursor() as cursor:
        for keyword in keywords:
            keyword_id = insert_or_get_keyword_id(conn, keyword)
            cursor.execute(
                "INSERT INTO photo_keywords (photo_id, keyword_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
                (photo_id, keyword_id)
            )
        conn.commit()


def insert_image_details_to_db(conn, image_details):
    # if image_details['gps_info'] is None:
    if not image_details['gps_info']:
        if image_details['title'] == 'Bern':
            image_details['gps_info']['Latitude'] = 46.947886
            image_details['gps_info']['Longitude'] = 7.454735

        # if image_details['title'] == 'Paul Klee': set gps
        if image_details['title'] == 'Paul Klee':
            image_details['gps_info']['Latitude'] = 46.9490227
            image_details['gps_info']['Longitude'] = 7.4743876
        # if image_details['title'] == 'Gurten': set gps
        if image_details['title'] == 'Gurten':
            image_details['gps_info']['Latitude'] = 46.916235
            image_details['gps_info']['Longitude'] = 7.439819
        # if image_details['title'] == 'Creux du Van': set gps
        if image_details['title'] == 'Creux du Van':
            image_details['gps_info']['Latitude'] = 46.9320198
            image_details['gps_info']['Longitude'] = 6.7230127
        # if image_details['title'] == 'Rivaz': set gps
        if image_details['title'] == 'Rivaz':
            image_details['gps_info']['Latitude'] = 46.466667
            image_details['gps_info']['Longitude'] = 6.8

    try:
        with conn.cursor() as cursor:
            insert_query = """
            INSERT INTO photos (filename, width, height, latitude, longitude, description, capture_date, extension, title)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING photo_id;
            """

            cursor.execute(
                insert_query,
                (
                    image_details['filename'],
                    image_details['size'][0],
                    image_details['size'][1],
                    image_details['gps_info'].get('Latitude'),
                    image_details['gps_info'].get('Longitude'),
                    image_details['description'],
                    image_details['capture_date'],
                    image_details['extension'],
                    image_details['title']
                )
            )
            photo_id = cursor.fetchone()[0]
            conn.commit()
            return photo_id
    except psycopg2.errors.UniqueViolation:
        print(f"Image {image_details['filename']} already exists in the database.")
        conn.rollback()
        return None
    except Exception as e:
        print(f"Error inserting image details into DB: {e}")
        conn.rollback()
        return None
