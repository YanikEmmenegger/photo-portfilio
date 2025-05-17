# media_processing.py
import os
import subprocess
import tempfile
import shutil
from PIL import Image, ImageFilter
from config import OUTPUT_FOLDERS, logger


# ----------------------------
# Image Processing Functions
# ----------------------------
def process_image(image_path, metadata):
    """
    Process an image into three versions:
    - Preview: Medium-quality, stored in the preview folder.
    - Full: High-quality version, stored in the full folder.
    - Thumbnail: Small blurred version, stored in the thumbs folder.
    """
    base_filename = metadata['filename']

    # Ensure output directories exist
    for folder in OUTPUT_FOLDERS.values():
        os.makedirs(folder, exist_ok=True)

    # Open the image using Pillow
    try:
        img = Image.open(image_path)
    except Exception as e:
        logger.error(f"Error opening image {image_path}: {e}")
        return None

    # Create preview image (middle quality, not blurred)
    preview_img = img.copy()
    preview_img.thumbnail((550, 550))
    preview_path = os.path.join(OUTPUT_FOLDERS["preview"], f"{base_filename}.jpg")
    preview_img.save(preview_path, quality=93)

    # Create full image (high quality)
    full_img = img.copy()
    full_img.thumbnail((1920, 1920))
    full_path = os.path.join(OUTPUT_FOLDERS["full"], f"{base_filename}-big.jpg")
    full_img.save(full_path, quality=90)

    # Create blurred thumbnail image for thumbs
    thumb_img = img.copy()
    thumb_img.thumbnail((50, 50))
    thumb_img = thumb_img.filter(ImageFilter.GaussianBlur(2))
    thumb_path = os.path.join(OUTPUT_FOLDERS["thumbs"], f"{base_filename}-thumb.jpg")
    thumb_img.save(thumb_path, quality=85)

    logger.info(f"Processed image '{image_path}': preview({preview_path}), full({full_path}), thumb({thumb_path})")
    return {"preview": preview_path, "full": full_path, "thumb": thumb_path}


# ----------------------------
# Video Processing Functions
# ----------------------------
def process_video(video_path, metadata):
    """
    Process a video file:
    - Extract the first frame for thumbnail images.
    - Generate two thumbnails:
      - A normal preview thumbnail.
      - A blurred thumbnail.
    - Process the full video:
      - If framerate >= 120, apply a slow-motion effect and reduce to 24fps.
      - Otherwise, simply reduce to 24fps.
    - Extract three key frames (first, middle, last) for AI analysis.
    """
    base_filename = metadata['filename']

    # Ensure output directories exist
    for folder in OUTPUT_FOLDERS.values():
        os.makedirs(folder, exist_ok=True)

    processed_paths = {}

    # 1. Extract the first frame as the preview thumbnail.
    preview_thumbnail = os.path.join(OUTPUT_FOLDERS["preview"], f"{base_filename}.jpg")
    cmd_preview = [
        "ffmpeg", "-y", "-i", video_path,
        "-vf", "select=eq(n\\,0)",
        "-q:v", "2", preview_thumbnail
    ]
    try:
        subprocess.run(cmd_preview, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.info(f"Extracted preview thumbnail for video '{video_path}' to '{preview_thumbnail}'")
        processed_paths["preview"] = preview_thumbnail
    except Exception as e:
        logger.error(f"Error extracting preview thumbnail for video '{video_path}': {e}")

    # 2. Create blurred thumbnail for thumbs using Pillow.
    try:


        img = Image.open(preview_thumbnail)
        img.thumbnail((50, 50))
        img = img.filter(ImageFilter.GaussianBlur(2))
        thumb_path = os.path.join(OUTPUT_FOLDERS["thumbs"], f"{base_filename}-thumb.jpg")
        img.save(thumb_path, quality=85)
        processed_paths["thumb"] = thumb_path
        logger.info(f"Created blurred thumbnail for video '{video_path}' to '{thumb_path}'")
    except Exception as e:
        logger.error(f"Error creating blurred thumbnail for video '{video_path}': {e}")

    # 3. Process the full video.
    full_video_path = os.path.join(OUTPUT_FOLDERS["full"], f"{base_filename}.mp4")

    # Determine slow-motion factor: if framerate >= 120, factor = framerate / 60; otherwise, factor = 1.
    framerate = metadata.get("framerate")
    if framerate and framerate >= 120:
        factor = framerate / 60
        # When slowing down, we drop audio for simplicity.
        slow_motion_filter = f"setpts=PTS*{factor},fps=24"
        cmd_full = [
            "ffmpeg", "-y", "-i", video_path,
            "-filter:v", slow_motion_filter,
            "-c:v", "libx264", "-crf", "20", "-preset", "slow",
            "-vf", "scale='min(1920,iw)':-2",  # Ensures max 1080p without distortion
            "-an", full_video_path
        ]
        logger.info(f"Processing slow-motion video for '{video_path}' with factor {factor}")

    else:
        # Normal processing: reduce to 24fps, compress, and limit resolution
        cmd_full = [
            "ffmpeg", "-y", "-i", video_path,
            "-r", "24",
            "-c:v", "libx264", "-crf", "20", "-preset", "slow",
            "-vf", "scale='min(1920,iw)':-2",  # Ensures max 1080p without distortion
            "-an",
            full_video_path
        ]
        logger.info(f"Processing normal speed video for '{video_path}'")

    try:
        subprocess.run(cmd_full, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        processed_paths["full"] = full_video_path
        logger.info(f"Processed full video for '{video_path}' to '{full_video_path}'")
    except Exception as e:
        logger.error(f"Error processing full video for '{video_path}': {e}")

    # 4. Extract three key frames (first, middle, last) for AI analysis.
    frames = extract_video_frames(video_path)
    processed_paths["frames"] = frames

    return processed_paths


def get_video_duration(video_path):
    """
    Get the duration of the video (in seconds) using ffprobe.
    """
    cmd = [
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration", "-of",
        "default=noprint_wrappers=1:nokey=1", video_path
    ]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        duration = float(result.stdout.strip())
        return duration
    except Exception as e:
        logger.error(f"Error getting duration for video '{video_path}': {e}")
        return None


def extract_video_frames(video_path):
    """
    Extract three frames from the video: first, middle, and last.
    Returns a dictionary with keys 'first', 'middle', 'last' and the corresponding file paths.
    Frames are saved in a temporary directory.
    """
    frames = {}
    duration = get_video_duration(video_path)
    if not duration:
        logger.error(f"Cannot extract frames without video duration for '{video_path}'")
        return frames

    temp_dir = tempfile.mkdtemp(prefix="video_frames_")

    positions = {
        "first": 0,
        "middle": duration / 2,
        "last": max(duration - 0.1, 0)
    }

    for key, pos in positions.items():
        frame_path = os.path.join(temp_dir, f"{key}.jpg")
        cmd = [
            "ffmpeg", "-y", "-ss", str(pos), "-i", video_path, "-frames:v", "1", "-q:v", "2", frame_path
        ]
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            frames[key] = frame_path
            logger.info(f"Extracted {key} frame for video '{video_path}' to '{frame_path}'")
        except Exception as e:
            logger.error(f"Error extracting {key} frame for video '{video_path}': {e}")

    return frames