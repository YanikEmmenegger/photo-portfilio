import base64
import requests
from env_setup import OPENAI_API_KEY
import os


# Function to encode the image in base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


# OpenAI API client setup
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}"
}


def create_description(metadata):
    try:
        # Define the path to the local image
        image_path = os.path.join('../new_photos', metadata['filename'] + metadata['extension'])

        # Encode image in base64
        base64_image = encode_image(image_path)

        # Construct prompt for image analysis
        prompt = (
            "Create a short and engaging caption for the provided photo. The caption should be based on both the metadata and a detailed analysis of the image itself. Please incorporate any visible elements or significant details observed in the image into the description. If a capture date is provided, include it in the caption.\n\n"
            f"Filename: {metadata['filename']}\n"
            f"Size: {metadata['size'][0]}x{metadata['size'][1]} pixels\n"
            f"Location: Latitude {metadata['gps_info'].get('Latitude', 'Unknown')}, "
            f"Longitude {metadata['gps_info'].get('Longitude', 'Unknown')}\n"
            f"Keywords: {', '.join(metadata['keywords'])}\n"
            f"Capture Date: {metadata['capture_date'].strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"Title: {metadata['title']}\n\n"
            "Instructions:\n"
            "1. Analyze the image to identify key elements, features, or ambiance.\n"
            "2. Use the metadata provided along with your analysis to generate a vivid and engaging caption.\n"
            "3. dont use hashtags and do not use quotes at the start and end if the capture date is from 2019 dont use it, its wrong. and dont use the time stamp, because of the timeshift\n\n"
            "4. you are allowed to use emojis but only if they are relevant to the image and max 2 and only on the end\n\n"
            "Description:"
        )

        #print(prompt)
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "high"  # Choose high detail for better analysis
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 70
        }

        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        response_data = response.json()
        print(response_data)

        # Extract description from response
        description = response_data['choices'][0]['message']['content']

        return description

    except Exception as e:
        print(f"Error generating description: {e}")
        return ""
