"""Unit tests for safe OpenRouter chat-completion parsing."""
from unittest.mock import MagicMock, patch

import pytest

from utils.openrouter import OpenRouterClient, OpenRouterError


def _response(payload, status_code=200):
    response = MagicMock()
    response.status_code = status_code
    response.ok = status_code < 400
    response.json.return_value = payload
    response.headers = {}
    return response


@patch("utils.openrouter.requests.post")
def test_chat_completion_extracts_message_content(post):
    post.return_value = _response({"choices": [{"message": {"content": "{\"response\": \"ok\"}"}}]})
    client = OpenRouterClient(api_key="test", max_retries=1)

    result = client.chat_completion(messages=[{"role": "user", "content": "Hello"}])

    assert result["content"] == '{"response": "ok"}'


@pytest.mark.parametrize("payload", [
    {},
    {"choices": []},
    {"choices": ["not-an-object"]},
    {"choices": [{}]},
    {"choices": [{"message": {"content": ""}}]},
])
@patch("utils.openrouter.requests.post")
def test_chat_completion_rejects_malformed_provider_shapes(post, payload):
    post.return_value = _response(payload)
    client = OpenRouterClient(api_key="test", max_retries=1)

    with pytest.raises(OpenRouterError):
        client.chat_completion(messages=[{"role": "user", "content": "Hello"}])


def test_retry_count_is_bounded():
    assert OpenRouterClient(api_key="test", max_retries=0).max_retries == 1
    assert OpenRouterClient(api_key="test", max_retries=99).max_retries == 3
