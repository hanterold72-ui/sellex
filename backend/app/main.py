import os
import logging
import time
import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from app.models import Base, engine, SessionLocal
from app.auth import router as auth_router
from app.admin_api import router as admin_router
from app.user_api import router as user_router
from app.tasks import router as tasks_router

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Sentry
if os.getenv("SENTRY_DSN"):
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        sentry_sdk.init(
            dsn=os.getenv("SENTRY_DSN"),
            integrations=[FastApiIntegration()],
            traces_sample_rate=0.1,
            environment=os.getenv("ENVIRONMENT", "production"),
        )
    except Exception as e:
        logger.warning(f"Sentry init failed: {e}")

# App
app = FastAPI(
    title="Sellex API",
    description="API генерации карточек и видео для маркетплейсов",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url=None,
)

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(duration)
    
    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} - {duration:.3f}s"
    )
    
    return response

# Routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(user_router, prefix="/api/user", tags=["user"])
app.include_router(tasks_router, prefix="/api", tags=["tasks"])

# Startup
@app.on_event("startup")
async def startup_event():
    logger.info("Starting Sellex API...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created")
    except Exception as e:
        logger.error(f"Database init error: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Sellex API...")

# Health
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "sellex-api",
        "version": "1.0.0",
        "timestamp": time.time()
    }

@app.get("/")
async def root():
    return {
        "name": "Sellex API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/metrics")
async def metrics():
    try:
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
    except ImportError:
        return {"error": "prometheus_client not installed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT") != "production"
    )