import os
from functools import lru_cache
from urllib.parse import urlsplit

import boto3
from botocore.client import BaseClient
from botocore.config import Config
from botocore.exceptions import ClientError

MAX_UPLOAD_SIZE = 10 * 1024 * 1024


def _storage_settings() -> tuple[str, str, str, str, str]:
    endpoint_url = os.getenv("S3_ENDPOINT_URL", "http://minio:9000")
    bucket_name = os.getenv("S3_BUCKET_NAME", "bluepeak-uploads")
    region = os.getenv("S3_REGION", "us-east-1")
    access_key = os.getenv("S3_ACCESS_KEY")
    secret_key = os.getenv("S3_SECRET_KEY")

    if not access_key or not secret_key:
        raise RuntimeError("S3_ACCESS_KEY and S3_SECRET_KEY must be configured")
    if not bucket_name:
        raise RuntimeError("S3_BUCKET_NAME must be configured")
    endpoint = urlsplit(endpoint_url)
    if endpoint.scheme not in {"http", "https"} or not endpoint.hostname:
        raise RuntimeError("S3_ENDPOINT_URL must be an HTTP(S) URL")

    return endpoint_url, bucket_name, region, access_key, secret_key


@lru_cache(maxsize=1)
def get_storage_client() -> BaseClient:
    endpoint_url, _, region, access_key, secret_key = _storage_settings()
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(
            connect_timeout=3,
            read_timeout=10,
            retries={"total_max_attempts": 2, "mode": "standard"},
            s3={"addressing_style": "path"},
            signature_version="s3v4",
        ),
    )


def get_bucket_name() -> str:
    return _storage_settings()[1]


def check_storage() -> None:
    get_storage_client().list_buckets()


def ensure_bucket() -> None:
    client = get_storage_client()
    bucket_name = get_bucket_name()
    try:
        client.head_bucket(Bucket=bucket_name)
        return
    except ClientError as error:
        error_code = str(error.response.get("Error", {}).get("Code", ""))
        status_code = error.response.get("ResponseMetadata", {}).get(
            "HTTPStatusCode"
        )
        if status_code != 404 and error_code not in {
            "404",
            "NoSuchBucket",
            "NotFound",
        }:
            raise

    _, _, region, _, _ = _storage_settings()
    create_args: dict[str, object] = {"Bucket": bucket_name}
    if region != "us-east-1":
        create_args["CreateBucketConfiguration"] = {"LocationConstraint": region}

    try:
        client.create_bucket(**create_args)
    except ClientError as error:
        error_code = str(error.response.get("Error", {}).get("Code", ""))
        if error_code != "BucketAlreadyOwnedByYou":
            raise


def upload_object(key: str, content: bytes, content_type: str) -> None:
    get_storage_client().put_object(
        Bucket=get_bucket_name(),
        Key=key,
        Body=content,
        ContentType=content_type,
    )


def list_objects() -> list[dict[str, object]]:
    client = get_storage_client()
    paginator = client.get_paginator("list_objects_v2")
    items: list[dict[str, object]] = []

    for page in paginator.paginate(Bucket=get_bucket_name()):
        for item in page.get("Contents", []):
            last_modified = item.get("LastModified")
            items.append(
                {
                    "key": item["Key"],
                    "size": item["Size"],
                    "last_modified": (
                        last_modified.isoformat() if last_modified else None
                    ),
                    "etag": item.get("ETag", "").strip('"'),
                }
            )

    return items
