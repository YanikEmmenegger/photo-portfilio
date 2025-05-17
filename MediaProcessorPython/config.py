# config.py
import logging
import os

from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()
# ----------------------------
# Logging Configuration
# ----------------------------
logging.basicConfig(
    level=logging.INFO,  # Set to DEBUG for more verbose output
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ----------------------------
# FTP Configuration
# ----------------------------
FTP_HOST = os.environ.get("FTP_HOST", "your_ftp_host")
FTP_PORT = int(os.environ.get("FTP_PORT", 21))
FTP_USER = os.environ.get("FTP_USER", "your_ftp_user")
FTP_PASSWORD = os.environ.get("FTP_PASSWORD", "your_ftp_password")

# ----------------------------
# Database Configuration
# ----------------------------
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_NAME = os.environ.get("DB_NAME", "photos_db")
DB_USER = os.environ.get("DB_USER", "your_db_user")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "your_db_password")
DB_PORT = int(os.environ.get("DB_PORT", 5432))

# ----------------------------
# OpenAI API Configuration
# ----------------------------
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "your_openai_api_key")

# ----------------------------
# Fallback GPS Coordinates
# ----------------------------
# This JSON file will contain keyword-to-GPS mappings (e.g., {"Cozumel": {"Latitude": 20.510, "Longitude": -86.945}})
GPS_FALLBACK_FILE = os.environ.get("GPS_FALLBACK_FILE", "gps_fallback.json")
VIDEO_KEYWORDS_FALLBACK_FILE = os.environ.get("VIDEO_KEYWORDS_FALLBACK_FILE", "video_keywords_fallback.json")

# ----------------------------
# Directory Paths
# ----------------------------
# Input folder containing original media (images and videos)
MEDIA_INPUT_FOLDER = "media"

# Local folders for processed media versions
OUTPUT_FOLDERS = {
    "thumbs": "thumbs",   # Blurred thumbnails
    "preview": "preview", # Medium quality, not blurred (for preview)
    "full": "full"        # High quality full images/videos
}