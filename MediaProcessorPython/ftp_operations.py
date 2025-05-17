# ftp_operations.py
import ftplib
import os
from config import FTP_HOST, FTP_PORT, FTP_USER, FTP_PASSWORD, logger

def connect_ftp():
    """
    Establish a connection to the FTP server.
    """


    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT)
        ftp.login(FTP_USER, FTP_PASSWORD)
        logger.info("Connected to FTP server.")
        return ftp
    except Exception as e:
        logger.error(f"FTP connection error: {e}")
        return None

def upload_to_ftp(ftp, file_path):
    """
    Upload the file to the FTP server and delete it locally on success.
    """
    try:
        with open(file_path, "rb") as f:
            ftp.storbinary(f"STOR {os.path.basename(file_path)}", f)
        logger.info(f"Uploaded {file_path} to FTP server.")
        # Delete the file after successful upload.
        os.remove(file_path)
        logger.info(f"Deleted local file: {file_path}")
    except Exception as e:
        logger.error(f"Error uploading {file_path} to FTP: {e}")