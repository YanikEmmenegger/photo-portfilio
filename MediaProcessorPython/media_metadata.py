# media_metadata.py
import json
import os
import subprocess
from datetime import datetime

import piexif
from PIL import Image
from iptcinfo3 import IPTCInfo

from config import logger, VIDEO_KEYWORDS_FALLBACK_FILE, GPS_FALLBACK_FILE

# Supported file extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.mpeg', '.mpg'}


def extract_metadata(media_path):
    """
    Determine the type of media (image or video) based on its extension
    and extract its metadata accordingly.
    """
    extension = os.path.splitext(media_path)[1].lower()
    if extension in IMAGE_EXTENSIONS:
        return extract_image_metadata(media_path)
    elif extension in VIDEO_EXTENSIONS:
        return extract_video_metadata(media_path)
    else:
        logger.warning(f"Unsupported media format: {media_path}")
        return None


def extract_image_metadata(image_path):
    """
    Extract metadata from an image file.
    Metadata includes: filename, extension, dimensions, GPS info, keywords, and capture date.
    """
    metadata = {}
    base_filename = os.path.splitext(os.path.basename(image_path))[0]
    extension = os.path.splitext(image_path)[1].lower()
    metadata['filename'] = base_filename
    metadata['extension'] = extension

    # Open image to get dimensions
    try:
        img = Image.open(image_path)
        metadata['size'] = img.size  # (width, height)
    except Exception as e:
        logger.error(f"Error opening image {image_path}: {e}")
        metadata['size'] = (0, 0)

    # Extract keywords first (needed for fallback GPS)
    metadata['keywords'] = extract_keywords(image_path)
    # Extract GPS info with fallback based on keywords if necessary
    metadata['gps_info'] = extract_gps_info(image_path, metadata['keywords'])
    metadata['capture_date'] = extract_capture_date(image_path)

    return metadata


def extract_video_metadata(video_path):
    """
    Extract metadata from a video file using ffprobe.
    Metadata includes: filename, extension, dimensions, framerate, capture date,
    and attempts to extract keywords.
    """
    metadata = {}
    base_filename = os.path.splitext(os.path.basename(video_path))[0]
    extension = os.path.splitext(video_path)[1].lower()
    metadata['filename'] = base_filename
    metadata['extension'] = extension

    # Command to run ffprobe and capture the JSON output
    cmd = [
        'ffprobe', '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,r_frame_rate,avg_frame_rate',
        '-show_entries', 'format_tags=creation_time,keywords',
        '-of', 'json', video_path
    ]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        data = json.loads(result.stdout)

        # Extract video dimensions and framerate
        if 'streams' in data and len(data['streams']) > 0:
            stream = data['streams'][0]
            width = stream.get('width')
            height = stream.get('height')
            metadata['size'] = (width, height)

            # Get framerate (e.g., "30000/1001")
            fr_str = stream.get('r_frame_rate')
            if fr_str and '/' in fr_str:
                num, denom = fr_str.split('/')
                try:
                    framerate = float(num) / float(denom)
                except ZeroDivisionError:
                    framerate = None
            else:
                framerate = None
            metadata['framerate'] = framerate

        # Extract creation time if available
        creation_time = None
        if 'format' in data and 'tags' in data['format'] and 'creation_time' in data['format']['tags']:
            creation_time_str = data['format']['tags']['creation_time']
            try:
                creation_time = datetime.fromisoformat(creation_time_str.replace("Z", "+00:00"))
            except Exception as e:
                logger.error(f"Error parsing creation_time for {video_path}: {e}")
                creation_time = None
        metadata['capture_date'] = creation_time

        # Attempt to extract keywords from ffprobe tags.
        keywords = []
        try:
            tags = data.get('format', {}).get('tags', {})
            if 'keywords' in tags:
                keywords = [k.strip() for k in tags['keywords'].split(',')]
        except Exception as e:
            logger.error(f"Error extracting video keywords for {video_path}: {e}")

        # If no keywords were found, use fallback based on filename.
        if not keywords:
            keywords = extract_video_keywords_fallback(video_path)
        metadata['keywords'] = keywords

        gps_info = get_fallback_gps(keywords)

        metadata['gps_info'] = gps_info


    except Exception as e:
        logger.error(f"Error extracting video metadata for {video_path}: {e}")
        metadata['size'] = (0, 0)
        metadata['framerate'] = None
        metadata['capture_date'] = None
        metadata['keywords'] = []

    # For videos, GPS info is often not embedded; set to an empty dict.
    #metadata['gps_info'] = {}

    print(metadata)

    return metadata


def extract_video_keywords_fallback(video_path):
    """
    Fallback to extract video keywords from the filename.
    Expected filename format: "K1-VideoName.mp4".
    Splits the filename at the first '-' and uses the first part as a key to search in the fallback JSON.
    """
    base_filename = os.path.basename(video_path)
    name_without_ext = os.path.splitext(base_filename)[0]
    parts = name_without_ext.split('-', 1)
    if parts:
        key = parts[0]
        try:
            with open(VIDEO_KEYWORDS_FALLBACK_FILE, "r") as f:
                mapping = json.load(f)
            if key in mapping:
                return mapping[key]
        except Exception as e:
            logger.error(f"Error loading fallback video keywords from {VIDEO_KEYWORDS_FALLBACK_FILE}: {e}")
    return []


def extract_gps_info(image_path, keywords=None):
    """
    Extract GPS information from the image's EXIF data.
    Returns a dictionary with 'Latitude' and 'Longitude' if available.
    If no GPS data is found and keywords are provided, attempts to use the fallback mapping.
    """
    gps_info = {}
    try:
        img = Image.open(image_path)
        exif_bytes = img.info.get('exif')
        if exif_bytes:
            exif_dict = piexif.load(exif_bytes)
            if 'GPS' in exif_dict and exif_dict['GPS']:
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
    except Exception as e:
        logger.error(f"Error extracting GPS info from {image_path}: {e}")

    # Use fallback mapping if no GPS info was found and keywords are provided.
    if (not gps_info or gps_info.get('Latitude') == 0.0) and keywords:
        fallback = get_fallback_gps(keywords)
        if fallback:
            logger.info(f"Using fallback GPS data for {image_path}: {fallback}")
            gps_info = fallback

    return gps_info


def get_fallback_gps(keywords):
    """
    Load the fallback GPS mapping from the JSON file and return the first matching GPS data based on the provided keywords.
    """
    try:
        with open(GPS_FALLBACK_FILE, "r") as f:
            mapping = json.load(f)
        for keyword in keywords:
            if keyword in mapping:
                return mapping[keyword]
    except Exception as e:
        logger.error(f"Error loading fallback GPS mapping from {GPS_FALLBACK_FILE}: {e}")
    return {}


def convert_to_decimal(degrees, ref):
    """
    Convert GPS coordinates from degrees, minutes, and seconds to decimal format.
    """
    try:
        d, m, s = [float(x[0]) / x[1] for x in degrees]
        decimal = d + (m / 60.0) + (s / 3600.0)
        if ref in ['S', 'W']:
            decimal = -decimal
        return decimal
    except Exception as e:
        logger.error(f"Error converting degrees to decimal: {e}")
        return 0.0


def extract_keywords(image_path):
    """
    Extract keywords from the image using IPTC data.
    """
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
        logger.error(f"Error extracting keywords from {image_path}: {e}")
    return keywords


def extract_capture_date(image_path):
    """
    Extract the capture date from the image EXIF data.
    """
    capture_date = None
    try:
        img = Image.open(image_path)
        exif_data = img._getexif()
        if exif_data and 36867 in exif_data:
            capture_date_str = exif_data[36867]
            capture_date = datetime.strptime(capture_date_str, "%Y:%m:%d %H:%M:%S")
    except Exception as e:
        logger.error(f"Error extracting capture date from {image_path}: {e}")
    if not capture_date:
        capture_date = datetime.now()
    return capture_date
