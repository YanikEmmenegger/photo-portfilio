import ftplib
import os


def connect_ftp():
    from env_setup import FTP_HOST, FTP_PORT, FTP_USER, FTP_PASSWORD
    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT)
        ftp.login(FTP_USER, FTP_PASSWORD)
        return ftp
    except ftplib.all_errors as e:
        print(f"FTP connection error: {e}")
        return None


def upload_to_ftp(ftp, file_path):
    try:
        with open(file_path, 'rb') as file:
            ftp.storbinary(f"STOR {os.path.basename(file_path)}", file)
        print(f"Uploaded {file_path} to FTP server.")

        # Delete the file after successful upload
        os.remove(file_path)
        # if filename includes thumb then delete the original file
        if "thumb" in file_path:
            original = file_path.replace("-thumb", "")
            original = original.replace("new_photos", "photos")
            os.remove(original)
        print(f"Deleted local file: {file_path}")
    except ftplib.all_errors as e:
        print(f"Failed to upload {file_path} to FTP server: {e}")
