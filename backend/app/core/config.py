import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, model_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "Omega Cosmetics API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Security & Admin Authentication
    ADMIN_PASSWORD: str = Field(default="", description="Password for admin dashboard")
    SECRET_KEY: str = Field(default="", description="Secret used to sign admin session cookies")
    ADMIN_SESSION_COOKIE: str = "admin_session"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"

    # Database: SQLite by default; supports PostgreSQL/Supabase via DATABASE_URL
    DATABASE_URL: str = Field(
        default="sqlite:///./Omega_cosmetics.db",
        description="Database connection string"
    )
    MEDIA_ROOT: Path = Field(
        default_factory=lambda: Path(__file__).resolve().parents[2] / "uploads",
        description="Persistent directory for uploaded product and admin images"
    )
    MEDIA_STORAGE: str = "local"
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "omega-media"
    APP_ENV: str = "development"
    PAYMENT_MODE: str = "manual"
    SELCOM_BASE_URL: str = ""
    SELCOM_API_KEY: str = ""
    SELCOM_API_SECRET: str = ""
    SELCOM_VENDOR_ID: str = ""
    FRONTEND_PUBLIC_URL: str = "http://localhost:3000"
    API_PUBLIC_URL: str = "http://localhost:8000"

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # SMTP Email Configuration
    SMTP_HOST: str = Field(default="", description="SMTP host (e.g. smtp.gmail.com)")
    SMTP_PORT: int = Field(default=587, description="SMTP port (e.g. 587 or 465)")
    SMTP_USER: str = Field(default="", description="SMTP username/email")
    SMTP_PASS: str = Field(default="", description="SMTP app password")
    CONTACT_TO_EMAIL: str = Field(default="Johnhandrick83@gmail.com", description="Destination email for inquiries & orders")
    ORDER_NOTIFICATION_EMAIL: str = Field(
        default="",
        description="Website owner's address for order notifications; falls back to CONTACT_TO_EMAIL",
    )

    # Brand Details
    BRAND_NAME: str = "Omega Cosmetics"
    BRAND_EMAIL: str = "Johnhandrick83@gmail.com"
    BRAND_PHONE: str = "+255625618209"
    BRAND_LOCATION: str = "Mwanjerwa, Mbeya, Tanzania"

    model_config = SettingsConfigDict(
        env_file=(
            Path(__file__).resolve().parents[2] / ".env",
            Path(__file__).resolve().parents[2] / ".env.local",
            Path(__file__).resolve().parents[3] / ".env",
            Path(__file__).resolve().parents[3] / ".env.local",
        ),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @model_validator(mode="after")
    def validate_payment_configuration(self):
        if self.MEDIA_STORAGE not in {"local", "supabase"}:
            raise ValueError("MEDIA_STORAGE must be local or supabase.")
        if self.PAYMENT_MODE not in {"manual", "test", "selcom"}:
            raise ValueError("PAYMENT_MODE must be manual, test, or selcom.")
        if self.APP_ENV == "production" and self.PAYMENT_MODE == "test":
            raise ValueError("Test payments must never be enabled in production.")
        if self.COOKIE_SAMESITE.lower() not in {"lax", "strict", "none"}:
            raise ValueError("COOKIE_SAMESITE must be lax, strict, or none.")
        if self.COOKIE_SAMESITE.lower() == "none" and not self.COOKIE_SECURE:
            raise ValueError("COOKIE_SECURE must be true when COOKIE_SAMESITE is none.")

        if self.APP_ENV == "production":
            if len(self.ADMIN_PASSWORD) < 12:
                raise ValueError("Production ADMIN_PASSWORD must be at least 12 characters.")
            if len(self.SECRET_KEY) < 32:
                raise ValueError("Production SECRET_KEY must be at least 32 characters.")
            if not self.COOKIE_SECURE:
                raise ValueError("COOKIE_SECURE must be true in production.")
            for name, url in (
                ("FRONTEND_PUBLIC_URL", self.FRONTEND_PUBLIC_URL),
                ("API_PUBLIC_URL", self.API_PUBLIC_URL),
            ):
                if not url.startswith("https://"):
                    raise ValueError(f"{name} must use HTTPS in production.")
            if not self.CORS_ORIGINS or any(
                origin == "*" or not origin.startswith("https://")
                for origin in self.CORS_ORIGINS
            ):
                raise ValueError("Production CORS_ORIGINS must contain only HTTPS origins.")
            if not all((self.SMTP_HOST, self.SMTP_USER, self.SMTP_PASS)):
                raise ValueError("SMTP_HOST, SMTP_USER, and SMTP_PASS are required in production.")
            if self.MEDIA_STORAGE != "supabase":
                raise ValueError("MEDIA_STORAGE must be supabase in production.")
            if not (
                self.SUPABASE_URL.startswith("https://")
                and self.SUPABASE_SERVICE_ROLE_KEY
                and self.SUPABASE_STORAGE_BUCKET
            ):
                raise ValueError(
                    "SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET "
                    "are required for production media storage."
                )
            if self.PAYMENT_MODE == "selcom" and not all(
                (
                    self.SELCOM_BASE_URL,
                    self.SELCOM_API_KEY,
                    self.SELCOM_API_SECRET,
                    self.SELCOM_VENDOR_ID,
                )
            ):
                raise ValueError("All Selcom credentials are required when PAYMENT_MODE is selcom.")
        return self


settings = Settings()
