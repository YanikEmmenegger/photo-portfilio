# db_operations.py
import psycopg2
from config import DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT, logger


def connect_db():
    """
    Establish a connection to the PostgreSQL database.
    """
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        logger.info("Connected to the database.")
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None


def insert_image_details_to_db(conn, media_details):
    """
    Insert media details into the photos table.

    Expected keys in media_details:
      - filename, size (tuple), gps_info (dict), capture_date, extension, title, description
    """
    try:
        with conn.cursor() as cursor:
            query = """
                INSERT INTO photos (filename, width, height, latitude, longitude, description, capture_date, extension, title)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING photo_id;
            """
            gps = media_details.get("gps_info", {})
            cursor.execute(query, (
                media_details.get("filename"),
                media_details.get("size")[0],
                media_details.get("size")[1],
                gps.get("Latitude"),
                gps.get("Longitude"),
                media_details.get("description"),
                media_details.get("capture_date"),
                media_details.get("extension"),
                media_details.get("title")
            ))
            photo_id = cursor.fetchone()[0]
            conn.commit()
            logger.info(f"Inserted media {media_details.get('filename')} with ID {photo_id} into DB.")
            return photo_id
    except Exception as e:
        conn.rollback()
        logger.error(f"Error inserting media into DB: {e}")
        return None


def insert_photo_keywords(conn, photo_id, keywords):
    """
    Insert keywords into the database and associate them with the given photo_id.
    """
    try:
        with conn.cursor() as cursor:
            for keyword in keywords:
                # Check if the keyword already exists.
                cursor.execute("SELECT keyword_id FROM keywords WHERE keyword = %s;", (keyword,))
                result = cursor.fetchone()
                if result:
                    keyword_id = result[0]
                else:
                    cursor.execute("INSERT INTO keywords (keyword) VALUES (%s) RETURNING keyword_id;", (keyword,))
                    keyword_id = cursor.fetchone()[0]
                # Insert the association into photo_keywords table.
                cursor.execute(
                    "INSERT INTO photo_keywords (photo_id, keyword_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
                    (photo_id, keyword_id)
                )
            conn.commit()
            logger.info(f"Inserted keywords for media ID {photo_id} into DB.")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error inserting keywords for media ID {photo_id}: {e}")