import os
from PIL import Image
from img_processing import create_image_versions, extract_gps_info, extract_keywords, extract_capture_date
from ftp_operations import connect_ftp, upload_to_ftp
from db_operations import connect_db, insert_image_details_to_db, insert_photo_keywords
from ai_functions import create_description


def process_images(input_folder, output_folder):
    for root, dirs, files in os.walk(input_folder):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                image_path = os.path.join(root, file)
                print(f"Processing {image_path}...")

                try:
                    # Open the image
                    img = Image.open(image_path)
                    base_filename = os.path.splitext(file)[0]

                    # Create image versions
                    create_image_versions(img, output_folder, base_filename)

                    # Extract metadata
                    gps_info = extract_gps_info(image_path)
                    keywords = extract_keywords(image_path)
                    capture_date = extract_capture_date(image_path)

                    image_details = {
                        'filename': file.split('.')[0],
                        'size': img.size,
                        'gps_info': gps_info,
                        'capture_date': capture_date,
                        'keywords': keywords,
                        'extension': '.' + file.split('.')[-1],

                    }
                    # if keywords contain 'Puerto Rico' then add 'Puerto Rico' to the title and if "La Réunion" then add "La Réunion" to the title
                    if 'Puerto Rico' in keywords:
                        image_details['title'] = 'Puerto Rico'
                    elif 'La Réunion' in keywords:
                        image_details['title'] = 'La Réunion'
                    elif 'Rivaz' in keywords:
                        image_details['title'] = 'Rivaz'
                    elif 'Creux Du Van' in keywords:
                        image_details['title'] = 'Creux du Van'
                    elif 'Paul Klee' in keywords:
                        image_details['title'] = 'Paul Klee'
                    elif 'Gurten' in keywords:
                        image_details['title'] = 'Gurten'
                    elif 'Bern' in keywords:
                        image_details['title'] = 'Bern'
                    elif 'Mexico' in keywords:
                        image_details['title'] = 'Mexico'
                    else:
                        image_details['title'] = 'Unknown'

                    # Generate description using AI
                    image_details['description'] = create_description(image_details)

                    # Upload to FTP server
                    ftp = connect_ftp()
                    upload_to_ftp(ftp, os.path.join(output_folder, base_filename + ".jpg"))
                    upload_to_ftp(ftp, os.path.join(output_folder, base_filename + "-thumb.jpg"))
                    upload_to_ftp(ftp, os.path.join(output_folder, base_filename + "-big.jpg"))
                    ftp.quit()

                    # Insert image details into the database
                    conn = connect_db()
                    photo_id = insert_image_details_to_db(conn, image_details)
                    if photo_id:
                        insert_photo_keywords(conn, photo_id, keywords)


                except Exception as e:
                    print(f"Error processing {file}: {e}")


if __name__ == "__main__":
    input_folder = "photos"
    output_folder = "new_photos"
    process_images(input_folder, output_folder)
