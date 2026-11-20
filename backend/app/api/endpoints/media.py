from urllib.parse import quote
from uuid import uuid4

import requests
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from backend.app.core.config import settings
from backend.app.core.security import require_admin

router = APIRouter(prefix="/admin/media", tags=["Admin Media"])

MAX_IMAGE_BYTES = 5 * 1024 * 1024
IMAGE_TYPES = {
    "image/jpeg": (".jpg", lambda content: content.startswith(b"\xff\xd8\xff")),
    "image/png": (".png", lambda content: content.startswith(b"\x89PNG\r\n\x1a\n")),
    "image/webp": (
        ".webp",
        lambda content: content.startswith(b"RIFF") and content[8:12] == b"WEBP",
    ),
}


def store_in_supabase(content: bytes, content_type: str, folder: str, filename: str) -> str:
    if not (
        settings.SUPABASE_URL
        and settings.SUPABASE_SERVICE_ROLE_KEY
        and settings.SUPABASE_STORAGE_BUCKET
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Hifadhi ya picha za Supabase haijasanidiwa.",
        )

    bucket = quote(settings.SUPABASE_STORAGE_BUCKET, safe="")
    object_path = quote(f"{folder}/{filename}", safe="/")
    storage_url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object"
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": content_type,
        "x-upsert": "false",
    }

    try:
        response = requests.post(
            f"{storage_url}/{bucket}/{object_path}",
            data=content,
            headers=headers,
            timeout=20,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Picha haikuweza kuhifadhiwa kwenye Supabase Storage.",
        ) from exc

    return f"{storage_url}/public/{bucket}/{object_path}"


async def store_image(file: UploadFile, folder: str) -> str:
    image_type = IMAGE_TYPES.get(file.content_type or "")
    if image_type is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Tumia picha ya JPEG, PNG au WebP.",
        )

    content = await file.read(MAX_IMAGE_BYTES + 1)
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Picha isizidi MB 5.",
        )
    extension, validate_signature = image_type
    if not validate_signature(content):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Maudhui ya faili hayaendani na aina ya picha iliyochaguliwa.",
        )

    target_folder = settings.MEDIA_ROOT / folder
    filename = f"{uuid4().hex}{extension}"
    if settings.MEDIA_STORAGE == "supabase":
        return store_in_supabase(
            content,
            file.content_type or "",
            folder,
            filename,
        )

    if settings.MEDIA_STORAGE != "local":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Hifadhi ya picha haijasanidiwa.",
        )

    target_folder.mkdir(parents=True, exist_ok=True)
    target_path = target_folder / filename
    target_path.write_bytes(content)
    return f"/uploads/{folder}/{filename}"


@router.post("/products")
async def upload_product_image(
    file: UploadFile = File(...),
    _: bool = Depends(require_admin),
):
    return {"path": await store_image(file, "products")}


@router.post("/profile")
async def upload_admin_avatar(
    file: UploadFile = File(...),
    _: bool = Depends(require_admin),
):
    return {"path": await store_image(file, "profiles")}
