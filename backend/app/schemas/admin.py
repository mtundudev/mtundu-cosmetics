from pydantic import BaseModel, Field, field_validator


class AdminProfileOut(BaseModel):
    display_name: str
    avatar_path: str | None = None


class AdminProfileUpdate(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=120)
    avatar_path: str | None = Field(default=None, max_length=255)

    @field_validator("display_name")
    @classmethod
    def normalize_display_name(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Jina la wasifu lazima liwe na angalau herufi 2.")
        return normalized
