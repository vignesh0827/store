from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./veggieflow.db"
    SECRET_KEY: str = "dev_secret_key_change_me_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    
    # Cloudinary Config (Get these from Cloudinary Dashboard)
    CLOUDINARY_CLOUD_NAME: str = "your_cloud_name"
    CLOUDINARY_API_KEY: str = "your_api_key"
    CLOUDINARY_API_SECRET: str = "your_api_secret"

    @property
    def origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
