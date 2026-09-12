from pathlib import Path
import os
import boto3
from dotenv import load_dotenv

load_dotenv()

BUCKET_NAME = os.getenv("AWS_S3_BUCKET")
PROJECT_ROOT = Path(__file__).resolve().parents[2]
LOCAL_DATA_DIR = PROJECT_ROOT / "Dataset" 
S3_ROOT_PREFIX = "raw"

s3 = boto3.client("s3")

def upload_raw_data():
    csv_files = list(LOCAL_DATA_DIR.glob("*.csv"))
    if not csv_files:
        print("No CSV files found.")
        return
    for file_path in csv_files:
        file_name = file_path.name
        dataset_name = file_path.stem
        s3_key = f"{S3_ROOT_PREFIX}/{dataset_name}/{file_name}"
        print(
            f"Uploading {file_name} "
            f"-> s3://{BUCKET_NAME}/{s3_key}"
        )

        s3.upload_file(str(file_path),BUCKET_NAME,s3_key)
        print(f"Uploaded {file_name}")
    print("\nAll files uploaded successfully.")

if __name__ == "__main__":
    upload_raw_data()