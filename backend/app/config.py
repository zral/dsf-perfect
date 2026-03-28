from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/markedsplass"
    REDIS_URL: str = "redis://localhost:6379/0"
    JWT_SECRET_KEY: str = "change-me-in-production-use-a-long-random-string"
    APP_ENV: str = "development"
    UPLOAD_DIR: str = "uploads"

    def model_post_init(self, __context: object) -> None:
        if self.JWT_SECRET_KEY.startswith("change-me"):
            if self.APP_ENV == "production":
                raise ValueError(
                    "JWT_SECRET_KEY must be set to a secure value in production. "
                    "Set a proper secret via the JWT_SECRET_KEY environment variable."
                )
            import warnings
            warnings.warn(
                "JWT_SECRET_KEY is using the default insecure value. "
                "Set a proper secret in production via the JWT_SECRET_KEY environment variable.",
                stacklevel=2,
            )
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:3000"
    APP_NAME: str = "Markedsplass"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}  # type: ignore[assignment]


@lru_cache
def get_settings() -> Settings:
    return Settings()
