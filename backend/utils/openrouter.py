"""Reusable OpenRouter API client with retry, timeout, and rate-limit handling."""
import json
import logging
import os
import time
from typing import Any, Dict, Optional

import requests

logger = logging.getLogger(__name__)


class OpenRouterError(Exception):
    """Base exception for OpenRouter client failures."""

    def __init__(self, message: str, status_code: Optional[int] = None, response_body: Optional[str] = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body


class OpenRouterRateLimitError(OpenRouterError):
    """Raised when the API returns a 429 Too Many Requests response."""


class OpenRouterTimeoutError(OpenRouterError):
    """Raised when the API request exceeds the configured timeout."""


class OpenRouterClient:
    """Thread-safe client for OpenRouter chat completions with retry logic."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: int = 60,
        max_retries: int = 3,
        backoff_factor: float = 1.5,
    ):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.api_url = api_url or os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions")
        self.model = model or os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")
        self.timeout = timeout
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor

        if not self.api_key:
            raise OpenRouterError("OPENROUTER_API_KEY is not configured.")

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.getenv("OPENROUTER_HTTP_REFERER", "https://skillpilot-ai.example.com"),
            "X-Title": os.getenv("OPENROUTER_APP_TITLE", "SkillPilot AI"),
        }

    def chat_completion(
        self,
        messages: list,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Send a chat completion request with automatic retries on transient failures."""
        if not messages or not isinstance(messages, list):
            raise OpenRouterError("Messages must be a non-empty list.")

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format:
            payload["response_format"] = response_format

        last_exception: Optional[OpenRouterError] = None

        for attempt in range(1, self.max_retries + 1):
            try:
                response = requests.post(
                    self.api_url,
                    headers=self._headers(),
                    json=payload,
                    timeout=self.timeout,
                )
            except requests.exceptions.Timeout as exc:
                logger.warning("OpenRouter request timed out on attempt %d/%d.", attempt, self.max_retries)
                last_exception = OpenRouterTimeoutError(f"Request timed out after {self.timeout}s.")
                if attempt < self.max_retries:
                    self._sleep(attempt)
                    continue
                raise last_exception from exc
            except requests.exceptions.RequestException as exc:
                logger.exception("OpenRouter request failed on attempt %d/%d.", attempt, self.max_retries)
                last_exception = OpenRouterError(f"Network error: {exc}")
                if attempt < self.max_retries:
                    self._sleep(attempt)
                    continue
                raise last_exception from exc

            if response.status_code == 429:
                retry_after = self._parse_retry_after(response)
                logger.warning("OpenRouter rate limited (429). Retry-After: %s. Attempt %d/%d.", retry_after, attempt, self.max_retries)
                if attempt < self.max_retries:
                    self._sleep(attempt, retry_after)
                    continue
                raise OpenRouterRateLimitError("Rate limit exceeded. Please try again later.", status_code=429, response_body=response.text)

            if response.status_code >= 500:
                logger.warning("OpenRouter server error (%d). Attempt %d/%d.", response.status_code, attempt, self.max_retries)
                if attempt < self.max_retries:
                    self._sleep(attempt)
                    continue
                raise OpenRouterError(f"OpenRouter server error: {response.status_code}", status_code=response.status_code, response_body=response.text)

            if not response.ok:
                logger.error("OpenRouter API error: %d %s", response.status_code, response.text[:500])
                raise OpenRouterError(
                    f"OpenRouter API error: {response.status_code}",
                    status_code=response.status_code,
                    response_body=response.text,
                )

            try:
                data = response.json()
            except ValueError as exc:
                logger.error("OpenRouter returned invalid JSON on attempt %d.", attempt)
                raise OpenRouterError("OpenRouter returned an invalid JSON response.") from exc

            if "choices" not in data or not data["choices"]:
                raise OpenRouterError("OpenRouter response is missing 'choices'.")

            content = data["choices"][0].get("message", {}).get("content", "")
            if not content:
                raise OpenRouterError("OpenRouter returned an empty message content.")

            usage = data.get("usage", {})
            logger.info(
                "OpenRouter completion succeeded. Tokens: prompt=%s, completion=%s, total=%s",
                usage.get("prompt_tokens"), usage.get("completion_tokens"), usage.get("total_tokens"),
            )
            return {"content": content, "raw": data}

        if last_exception:
            raise last_exception
        raise OpenRouterError("OpenRouter request failed after maximum retries.")

    def _sleep(self, attempt: int, retry_after: Optional[float] = None) -> None:
        """Sleep with exponential backoff, optionally respecting Retry-After header."""
        if retry_after is not None and retry_after > 0:
            delay = retry_after
        else:
            delay = self.backoff_factor ** (attempt - 1)
        logger.info("Sleeping for %.2f seconds before retry.", delay)
        time.sleep(delay)

    def _parse_retry_after(self, response: requests.Response) -> Optional[float]:
        """Extract Retry-After header value as seconds, if present."""
        header = response.headers.get("Retry-After")
        if header is None:
            return None
        try:
            return float(header)
        except (TypeError, ValueError):
            return None
