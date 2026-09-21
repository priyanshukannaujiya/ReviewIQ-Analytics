from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, reviews, analytics, products, uploads, complaints
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(title="ReviewIQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["complaints"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(products.router, prefix="/api/products", tags=["products"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "reviewiq-api"}
