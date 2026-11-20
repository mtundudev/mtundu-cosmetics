from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.app.core.config import settings


def normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgres://"):
        database_url = "postgresql://" + database_url[len("postgres://"):]
    if database_url.startswith("postgresql://"):
        return "postgresql+psycopg://" + database_url[len("postgresql://"):]
    return database_url


# Handle sqlite specific connection args
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    normalize_database_url(settings.DATABASE_URL),
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides an active database session and ensures closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
