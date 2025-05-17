# ai_functions.py
import base64
import json
import requests
from config import OPENAI_API_KEY, logger


def encode_file(file_path):
    """
    Encode the file (image or frame) in base64.
    """
    try:
        with open(file_path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
        return encoded
    except Exception as e:
        logger.error(f"Error encoding file {file_path}: {e}")
        return ""


def create_description(metadata, ai_input):
    """
    Generate a title and description using the AI endpoint.

    For images, ai_input should be:
      {"media_path": "<path_to_preview_image>", "type": "image"}

    For videos, ai_input should be:
      {"frames": {"first": <path>, "middle": <path>, "last": <path>}, "type": "video"}

    In this version, we add the base64-encoded media data as a separate content item.
    """
    try:
        # Prepare the prompt (metadata and instructions)
        gps = metadata.get("gps_info", {})
        gps_text = f"Latitude {gps.get('Latitude', 'Unknown')}, Longitude {gps.get('Longitude', 'Unknown')}"
        keywords = ", ".join(metadata.get("keywords", []))
        capture_date = metadata.get("capture_date")
        if capture_date and hasattr(capture_date, "strftime"):
            capture_date_str = capture_date.strftime("%Y-%m-%d %H:%M:%S")
        else:
            capture_date_str = "Unknown"

        prompt = (
            "Generate a title and a description for the following media.\n"
            "Title should be concise (max 4 words).\n"
            "Description should be short, engaging, and include details from both the content and its metadata.\n\n"
            f"Keywords: {keywords}\n"
            "Instructions:\n"
            "1. Create a title (max 4 words).\n"
            "2. Create a short, engaging description.\n"
            "3. Do not include hashtags or extra quotes.\n\n"
            "Output format = <title> | <description>\n\n"
        )

        # Prepare media data as a separate message.
        if ai_input.get("type") == "image":
            file_path = ai_input.get("media_path")
            base64_image = encode_file(file_path)
            media_content = {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}",
                    "detail": "high"
                }
            }
        elif ai_input.get("type") == "video":
            # For video, you might want to include several frames.
            # Here we concatenate the frames into a single string, or create separate image messages as needed.
            frames = ai_input.get("frames", {})
            # For this example, we'll assume the first frame is representative.

            logger.info(f"Frames: {frames}")

            if "first" in frames:
                base64_image = encode_file(frames["first"])
                media_content = {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}",
                        "detail": "high"
                    }
                }
            else:
                media_content = {}
        else:
            media_content = {}

        # Build the payload with two content items: one for text and one for the image.
        payload = {
            "model": "gpt-4o-mini",  # or the appropriate model name
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        media_content
                    ]
                }
            ],
            "max_tokens": 200
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        response = requests.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        logger.info(f"AI response: {data}")

        response_data = response.json()

        # Extract description from response
        content = response_data['choices'][0]['message']['content']

        # Split the content into title and description
        title, description = content.split("|")
        return {"title": title.strip(), "description": description.strip()}

    except Exception as e:
        logger.error(f"Error generating description: {e}")
        return None