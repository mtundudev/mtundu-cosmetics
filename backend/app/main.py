from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.core.config import settings
from backend.app.db.init_db import init_db
from backend.app.api.api_v1 import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed initial catalog data on startup
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Omega Cosmetics E-Commerce Backend API - Swahili & English Cosmetics Store",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)
if settings.MEDIA_STORAGE == "local":
    settings.MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.MEDIA_ROOT), name="uploads")

# Configure CORS Middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root_status():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "brand": settings.BRAND_NAME,
        "location": settings.BRAND_LOCATION,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "backend"}
