from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.topics.router import router as topics_router
from app.modules.translations.router import router as translations_router
from app.modules.quiz.router import router as quiz_router
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.auth.dependencies import get_current_admin_user
import time
import httpx

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"[{request.method}] {request.url.path} [{response.status_code}] {process_time:.2f}s")
    return response

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(topics_router, prefix=settings.API_V1_STR)
app.include_router(translations_router, prefix=settings.API_V1_STR)
app.include_router(quiz_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        from sqlalchemy import text
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "db": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "db": str(e)}


@app.get(f"{settings.API_V1_STR}/settings")
async def get_platform_settings(admin=Depends(get_current_admin_user)):
    """Admin: Returns non-sensitive platform configuration."""
    # Check Ollama connectivity
    ollama_status = "offline"
    ollama_models = []
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                ollama_status = "online"
                data = resp.json()
                ollama_models = [m["name"] for m in data.get("models", [])]
    except Exception:
        pass

    return {
        "platform": {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "api_prefix": settings.API_V1_STR,
        },
        "database": {
            "server": settings.POSTGRES_SERVER,
            "port": settings.POSTGRES_PORT,
            "name": settings.POSTGRES_DB,
        },
        "auth": {
            "algorithm": settings.ALGORITHM,
            "access_token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            "refresh_token_expire_days": settings.REFRESH_TOKEN_EXPIRE_DAYS,
        },
        "ai_service": {
            "provider": "Ollama",
            "base_url": settings.OLLAMA_BASE_URL,
            "model": settings.OLLAMA_MODEL,
            "status": ollama_status,
            "available_models": ollama_models,
        },
        "cors_origins": settings.BACKEND_CORS_ORIGINS,
    }
