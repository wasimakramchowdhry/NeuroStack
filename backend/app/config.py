from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, computed_field, field_validator
from typing import Optional, Union
import json

class Settings(BaseSettings):
    PROJECT_NAME: str
    VERSION: str
    API_V1_STR: str

    # CORS
    BACKEND_CORS_ORIGINS: list[str]

    # Database
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int

    @computed_field
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # JWT Security
    SECRET_KEY: str 
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    # Bhashini Translation API
    BHASHINI_USER_ID: str
    BHASHINI_API_KEY: str
    BHASHINI_PIPELINE_ID: str
    BHASHINI_PIPELINE_URL: str
    BHASHINI_INFERENCE_URL: str

    # Ollama AI Service
    OLLAMA_BASE_URL: str
    OLLAMA_MODEL: str

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, list[str]]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        return v

    # Redis for Celery
    REDIS_URL: str = "redis://redis:6379/0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore"
    )

try:
    settings = Settings()
except Exception as e:
    import sys
    print(f"\n❌ SETTINGS ERROR: {e}\n", file=sys.stderr)
    print("Please check your .env file for missing or invalid values.\n", file=sys.stderr)
    # Re-raise so the process still exits, but with a clear message in logs
    raise

