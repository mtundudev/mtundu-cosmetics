from uuid import uuid4

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
    target_folder.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{extension}"
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
