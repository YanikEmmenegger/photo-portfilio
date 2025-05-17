# process_media.py
import os
from config import MEDIA_INPUT_FOLDER, logger
from media_metadata import extract_metadata
from media_processing import process_image, process_video
from ai_functions import create_description
from ftp_operations import connect_ftp, upload_to_ftp
from db_operations import connect_db, insert_image_details_to_db, insert_photo_keywords

def process_media():
    # Connect to FTP server once for uploading processed files
    ftp = connect_ftp()
    if not ftp:
        logger.error("FTP connection could not be established. Exiting.")
        return

    # Connect to the database once
    db_conn = connect_db()

    # Walk through the media input folder
    for root, dirs, files in os.walk(MEDIA_INPUT_FOLDER):
        for file in files:
            media_path = os.path.join(root, file)
            logger.info(f"Processing media file: {media_path}")

            # Extract metadata (this function distinguishes between images and videos)
            metadata = extract_metadata(media_path)
            if not metadata:
                logger.warning(f"Skipping unsupported media: {media_path}")
                continue

            # Process the media based on its type
            processed_paths = {}
            if metadata['extension'] in {'.jpg', '.jpeg', '.png'}:
                # Image processing
                processed_paths = process_image(media_path, metadata)
            else:
                # Video processing
                processed_paths = process_video(media_path, metadata)

            # Prepare input for the AI function:
            # For images, we send the preview image;
            # For videos, we send the extracted key frames.
            try:
                if metadata['extension'] in {'.jpg', '.jpeg', '.png'}:
                    ai_input = {"media_path": processed_paths.get("preview"), "type": "image"}
                else:
                    ai_input = {"frames": processed_paths.get("frames", {}), "type": "video"}

                ai_result = create_description(metadata, ai_input)
                logger.info(f"AI generated result: {ai_result}")
                # Expecting ai_result to be a dict: {"title": "...", "description": "..."}
                if ai_result:
                    metadata['title'] = ai_result.get("title", "Unknown")
                    metadata['description'] = ai_result.get("description", "")
                else:
                    metadata['title'] = "Unknown"
                    metadata['description'] = ""
                logger.info(f"AI generated title: {metadata['title']} and description: {metadata['description']}")
            except Exception as e:
                logger.error(f"Error during AI processing for {media_path}: {e}")
                metadata['title'] = "Unknown"
                metadata['description'] = ""

            # Insert media details into the database
            try:
                media_id = insert_image_details_to_db(db_conn, metadata)
                if media_id and metadata.get("keywords"):
                    insert_photo_keywords(db_conn, media_id, metadata["keywords"])
                logger.info(f"Inserted media {media_path} into database with ID {media_id}")
            except Exception as e:
                logger.error(f"Error inserting media into DB for {media_path}: {e}")

            # Upload processed files to the FTP server.
            # We expect processed_paths to include keys "preview", "full", and "thumb".
            for key in ["preview", "full", "thumb"]:
                file_path = processed_paths.get(key)
                if file_path and os.path.exists(file_path):
                    try:
                        upload_to_ftp(ftp, file_path)
                        logger.info(f"Uploaded {file_path} to FTP server.")
                    except Exception as e:
                        logger.error(f"Error uploading {file_path} to FTP: {e}")

            # Delete the original media file after processing
            try:
                os.remove(media_path)
                logger.info(f"Deleted original media file: {media_path}")
            except Exception as e:
                logger.error(f"Error deleting original media file {media_path}: {e}")

    # Close FTP and database connections
    try:
        ftp.quit()
    except Exception as e:
        logger.error(f"Error closing FTP connection: {e}")
    try:
        db_conn.close()
    except Exception as e:
        logger.error(f"Error closing DB connection: {e}")

if __name__ == "__main__":
    process_media()