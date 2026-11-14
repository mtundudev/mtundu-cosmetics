import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    PROJECT_NAME: str = "Mtundu Cosmetics API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Security & Admin Authentication
    ADMIN_PASSWORD: str = Field(default="admin123", description="Password for admin dashboard")
    SECRET_KEY: str = Field(default="mtundu-cosmetics-secret-key-change-in-production-2026", description="JWT/Cookie secret key")
    ADMIN_SESSION_COOKIE: str = "admin_session"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database: SQLite by default; supports PostgreSQL/Supabase via DATABASE_URL
    DATABASE_URL: str = Field(
        default="sqlite:///./mtundu_cosmetics.db",
        description="Database connection string"
    )

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://mtunducosmetics.co.tz",
        "https://vipodozi-shop.vercel.app"
    ]

    # SMTP Email Configuration
    SMTP_HOST: str = Field(default="", description="SMTP host (e.g. smtp.gmail.com)")
    SMTP_PORT: int = Field(default=587, description="SMTP port (e.g. 587 or 465)")
    SMTP_USER: str = Field(default="", description="SMTP username/email")
    SMTP_PASS: str = Field(default="", description="SMTP app password")
    CONTACT_TO_EMAIL: str = Field(default="dottomtundu9@gmail.com", description="Destination email for inquiries & orders")

    # Brand Details
    BRAND_NAME: str = "Mtundu Cosmetics"
    BRAND_EMAIL: str = "dottomtundu9@gmail.com"
    BRAND_PHONE: str = "+255 769752523"
    BRAND_LOCATION: str = "Mwanjerwa, Mbeya, Tanzania"

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local", "../.env.local", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
