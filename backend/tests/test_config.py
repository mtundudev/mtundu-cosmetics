import unittest
from pydantic import ValidationError

from backend.app.core.config import Settings
from backend.app.db.session import normalize_database_url


def production_settings(**overrides):
    values = {
        "APP_ENV": "production",
        "PAYMENT_MODE": "manual",
        "ADMIN_PASSWORD": "secure-admin-password",
        "SECRET_KEY": "s" * 40,
        "COOKIE_SECURE": True,
        "FRONTEND_PUBLIC_URL": "https://shop.example.com",
        "API_PUBLIC_URL": "https://api.example.com",
        "CORS_ORIGINS": ["https://shop.example.com"],
        "SMTP_HOST": "smtp.example.com",
        "SMTP_USER": "shop@example.com",
        "SMTP_PASS": "smtp-app-password",
        "MEDIA_STORAGE": "supabase",
        "SUPABASE_URL": "https://project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "server-only-test-key",
        "SUPABASE_STORAGE_BUCKET": "omega-media",
    }
    values.update(overrides)
    return Settings(**values)


class ProductionSettingsTests(unittest.TestCase):
    def test_accepts_secure_configuration(self):
        settings = production_settings()

        self.assertEqual(settings.APP_ENV, "production")
        self.assertTrue(settings.COOKIE_SECURE)

    def test_rejects_incomplete_or_unsafe_configuration(self):
        invalid_overrides = [
            {"ADMIN_PASSWORD": ""},
            {"SECRET_KEY": "too-short"},
            {"COOKIE_SECURE": False},
            {"PAYMENT_MODE": "test"},
            {"SMTP_PASS": ""},
            {"CORS_ORIGINS": ["http://localhost:3000"]},
            {"PAYMENT_MODE": "selcom"},
            {"MEDIA_STORAGE": "local"},
            {"SUPABASE_SERVICE_ROLE_KEY": ""},
        ]
        for overrides in invalid_overrides:
            with self.subTest(overrides=overrides):
                with self.assertRaises(ValidationError):
                    production_settings(**overrides)

    def test_none_samesite_requires_secure_cookie(self):
        with self.assertRaises(ValidationError):
            Settings(COOKIE_SAMESITE="none", COOKIE_SECURE=False)

    def test_normalizes_render_postgres_urls_for_psycopg(self):
        self.assertEqual(
            normalize_database_url("postgres://user:pass@host/db"),
            "postgresql+psycopg://user:pass@host/db",
        )
        self.assertEqual(
            normalize_database_url("postgresql://user:pass@host/db"),
            "postgresql+psycopg://user:pass@host/db",
        )


if __name__ == "__main__":
    unittest.main()
