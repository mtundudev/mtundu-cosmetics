from fastapi import APIRouter
from backend.app.api.endpoints import auth, orders, reviews, contact, products, media, services

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(orders.router)
api_router.include_router(reviews.router)
api_router.include_router(contact.router)
api_router.include_router(products.router)
api_router.include_router(media.router)
api_router.include_router(services.router)
