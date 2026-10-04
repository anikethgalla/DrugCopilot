import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Project metadata
    PROJECT_NAME: str = "Drug Repurposing Copilot"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Server settings
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: list[str] = ["*"]

    # Neo4j Database
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USERNAME: str = "neo4j"
    NEO4J_PASSWORD: str = "biomedical_graph_password_2025"
    NEO4J_DATABASE: str = "neo4j"
    NEO4J_MAX_CONNECTION_LIFETIME: int = 3600
    NEO4J_MAX_CONNECTION_POOL_SIZE: int = 50

    # Redis Cache & Queue
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_EXPIRATION_SECONDS: int = 86400  # 24 hours

    # LLM Settings (Google Gemini & OpenAI Compatible)
    GEMINI_API_KEY: Optional[str] = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    GEMINI_MODEL: str = "gemini-2.5-flash"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gemini-2.5-flash"
    LLM_TEMPERATURE: float = 0.1

    # External Biomedical APIs
    CHEMBL_BASE_URL: str = "https://www.ebi.ac.uk/chembl/api/data"
    OPENTARGETS_GRAPHQL_URL: str = "https://api.platform.opentargets.org/api/v4/graphql"
    UNIPROT_BASE_URL: str = "https://rest.uniprot.org/uniprotkb"
    PUBCHEM_BASE_URL: str = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
    CLINICALTRIALS_BASE_URL: str = "https://clinicaltrials.gov/api/v2/studies"
    PUBMED_ESEARCH_URL: str = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    PUBMED_ESUMMARY_URL: str = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
    PUBMED_EFETCH_URL: str = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

    # Optional API Keys & Credentials
    NCBI_API_KEY: Optional[str] = None
    PUBMED_EMAIL: Optional[str] = "drugcopilot@biomedical.org"

    # Ingestion Default Limits
    CHEMBL_LIMIT: int = 500
    OPENTARGETS_LIMIT: int = 500
    CLINICALTRIALS_LIMIT: int = 200
    PUBMED_LIMIT: int = 100

    # HTTP Client Configuration
    HTTP_TIMEOUT_SECONDS: float = 30.0
    HTTP_MAX_RETRIES: int = 3
    HTTP_RETRY_BACKOFF_FACTOR: float = 1.5


settings = Settings()
