from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.init_db import init_db
from app.api.api_v1 import api_router
from app.api.endpoints import auth, orders, reviews, contact, products


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed initial catalog data on startup
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Mtundu Cosmetics E-Commerce Backend API - Swahili & English Cosmetics Store",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include master API v1 router: /api/v1/...
app.include_router(api_router, prefix=settings.API_V1_STR)

# Also include top-level /api/... aliases for direct compatibility with Next.js frontend
app.include_router(auth.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(products.router, prefix="/api")


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
