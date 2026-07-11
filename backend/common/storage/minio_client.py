from minio import Minio
from minio.error import S3Error
import os
from dotenv import load_dotenv

load_dotenv()

def _required(key: str) -> str:
    value = os.getenv(key)
    if value is None:
        raise RuntimeError(f"Missing required environment variable: {key}")
    return value

# configuration (static)
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_SECURE = os.getenv("MINIO_USE_HTTPS", "false").lower() == "true"

if MINIO_ENDPOINT and MINIO_ACCESS_KEY and MINIO_SECRET_KEY:
    minio_client = Minio(
        MINIO_ENDPOINT,
        access_key= MINIO_ACCESS_KEY,
        secret_key= MINIO_SECRET_KEY,
        secure= MINIO_SECURE
    )
else:
    minio_client = None
    print("[MinIO] WARNING: Storage credentials missing. File uploads will be disabled and fall back to local disk.")

# buckets
REQUIRED_BUCKETS = [
    "artifacts",
    "audit"
]

# bucket initialization
def initialize_buckets() -> None:
    if minio_client is None:
        print("[MinIO] Storage client not initialized. Skipping bucket creation.")
        return
    # ensure all buckets exist. safe to run multiple times.
    for bucket in REQUIRED_BUCKETS:
        try:
            if not minio_client.bucket_exists(bucket):
                minio_client.make_bucket(bucket)
                print(f"[MinIO] Created bucket: {bucket}")
            else:
                print(f"[MinIO] Bucket already exists: {bucket}")
        except S3Error as e:
            print(f"[MinIO] Error creating bucket '{bucket}': {e}")
            raise

# file upload helper
def upload_file(bucket: str, object_name: str, file_path: str) -> dict:
    if minio_client is None:
        raise RuntimeError("MinIO client is not initialized.")
    # upload local file to minio. return dict suitable for inserting into artifacts table.
    if not bucket in REQUIRED_BUCKETS:
        raise ValueError(f"Bucket '{bucket}' is not recognized. Must be one of : {REQUIRED_BUCKETS}")
    
    try:
        minio_client.fput_object(
            bucket_name= bucket,
            object_name= object_name,
            file_path= file_path
        )

        return {
            "bucket": bucket,
            "object_name": object_name,
            "uri": f"minio://{bucket}/{object_name}"
        }
    
    except S3Error as e:
        print(f"[MinIO] Failed to upload '{file_path}' to bucket '{bucket}': {e}")
        raise

# pre signed url for downloads
def presigned_url(bucket: str, object_name: str, expires: int = 3600) -> str:
    if minio_client is None:
        raise RuntimeError("MinIO client is not initialized.")
    # return signed temp url for downloading files.
    try:
        return minio_client.presigned_get_object(
            bucket_name=bucket,
            object_name=object_name,
            expires=expires
        )
    except S3Error as e:
        print(f"[MinIO] Failed to generate presigned URL: {e}")
        raise

