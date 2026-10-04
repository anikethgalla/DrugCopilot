import asyncio
import logging
from typing import Any, Dict, Optional
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import settings

logger = logging.getLogger(__name__)


class BaseBiomedicalClient:
    """
    Base HTTP client for real biomedical APIs.
    Enforces rate limiting, retries with exponential backoff, structured error handling,
    and User-Agent compliance.
    """
    def __init__(self, base_url: str, rate_limit_delay: float = 0.2):
        self.base_url = base_url.rstrip("/")
        self.rate_limit_delay = rate_limit_delay
        self._last_request_time = 0.0
        self._client: Optional[httpx.AsyncClient] = None

    async def get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            headers = {
                "User-Agent": "DrugRepurposingCopilot/1.0.0 (Research Tool; mailto:drugcopilot@biomedical.org)",
                "Accept": "application/json"
            }
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(settings.HTTP_TIMEOUT_SECONDS, connect=10.0),
                headers=headers,
                follow_redirects=True
            )
        return self._client

    async def _enforce_rate_limit(self):
        now = asyncio.get_event_loop().time()
        elapsed = now - self._last_request_time
        if elapsed < self.rate_limit_delay:
            await asyncio.sleep(self.rate_limit_delay - elapsed)
        self._last_request_time = asyncio.get_event_loop().time()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1.5, min=1, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        reraise=True
    )
    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Performs a robust GET request with rate limiting and exponential retries."""
        await self._enforce_rate_limit()
        client = await self.get_client()
        url = f"{self.base_url}/{endpoint.lstrip('/')}" if endpoint else self.base_url
        
        try:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.warning("HTTP %s on %s: %s", e.response.status_code, url, e.response.text[:200])
            raise
        except Exception as e:
            logger.error("Request failed on %s: %s", url, e)
            raise

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1.5, min=1, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        reraise=True
    )
    async def post(self, endpoint: str, json_data: Dict[str, Any], headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Performs a robust POST request with rate limiting and exponential retries."""
        await self._enforce_rate_limit()
        client = await self.get_client()
        url = f"{self.base_url}/{endpoint.lstrip('/')}" if endpoint else self.base_url
        
        try:
            response = await client.post(url, json=json_data, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.warning("HTTP %s on %s: %s", e.response.status_code, url, e.response.text[:200])
            raise
        except Exception as e:
            logger.error("POST request failed on %s: %s", url, e)
            raise

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None
