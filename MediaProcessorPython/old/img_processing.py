import os

from PIL import Image, ImageFilter
import piexif
from iptcinfo3 import IPTCInfo
from datetime import datetime


def convert_to_decimal(degrees, ref):
    try:
        d, m, s = [float(x[0]) / x[1] for x in degrees]
        decimal = d + (m / 60.0) + (s / 3600.0)
        if ref in ['S', 'W']:
            decimal = -decimal
        return decimal
    except ValueError as e:
        print(f"Error converting coordinates: {e}")
        return 0.0


def extract_gps_info(image_path):
    gps_info = {}
    try:
        im = Image.open(image_path)
        exif_dict = piexif.load(im.info.get('exif', b''))

        if 'GPS' in exif_dict:
            gps_data = exif_dict['GPS']
            latitude = gps_data.get(piexif.GPSIFD.GPSLatitude)
            longitude = gps_data.get(piexif.GPSIFD.GPSLongitude)
            latitude_ref = gps_data.get(piexif.GPSIFD.GPSLatitudeRef, b'N').decode()
            longitude_ref = gps_data.get(piexif.GPSIFD.GPSLongitudeRef, b'E').decode()

            if latitude and longitude:
                latitude_decimal = convert_to_decimal(latitude, latitude_ref)
                longitude_decimal = convert_to_decimal(longitude, longitude_ref)

                gps_info = {
                    "Latitude": latitude_decimal,
                    "Longitude": longitude_decimal
                }
        else:
            print("No GPS data found in EXIF.")
    except Exception as e:
        print(f"Error extracting GPS info: {e}")

    return gps_info


def extract_keywords(image_path):
    keywords = []
    try:
        info = IPTCInfo(image_path)
        for keyword in info['keywords']:
            if isinstance(keyword, bytes):
                try:
                    keyword = keyword.decode('utf-8')
                except UnicodeDecodeError:
                    keyword = keyword.decode('utf-8', errors='replace')
            keywords.append(keyword)
    except Exception as e:
        print(f"Error reading keywords from {image_path}: {e}")
    return keywords


def extract_capture_date(image_path):
    try:
        im = Image.open(image_path)
        exif_data = im._getexif()
        if exif_data and 36867 in exif_data:
            capture_date_str = exif_data[36867]
            capture_date = datetime.strptime(capture_date_str, "%Y:%m:%d %H:%M:%S")
            return capture_date
    except Exception as e:
        print(f"Error extracting capture date: {e}")
    return datetime.now()


def create_image_versions(img, output_folder, base_filename):
    try:
        # Thumbnail image
        thumbnail = img.copy()
        thumbnail.thumbnail((50, 50))
        thumbnail = thumbnail.filter(ImageFilter.GaussianBlur(2))
        thumbnail.save(os.path.join(output_folder, base_filename + "-thumb.jpg"), quality=85)

        # Gallery image (max 550px on longer side, 10% better quality)
        gallery_img = img.copy()
        gallery_img.thumbnail((550, 550))
        gallery_img.save(os.path.join(output_folder, base_filename + ".jpg"), quality=93)

        # Focus image (max 1920px on longer side)
        focus_img = img.copy()
        focus_img.thumbnail((1920, 1920))
        focus_img.save(os.path.join(output_folder, base_filename + "-big.jpg"), quality=90)
    except Exception as e:
        print(f"Error creating image versions: {e}")
