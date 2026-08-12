import os
import json
import requests
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(__file__)
load_dotenv(os.path.join(BASE_DIR, '.env'))

API_KEY = os.getenv('OPENROUTER_API_KEY')
API_URL = os.getenv('OPENROUTER_API_URL', 'https://openrouter.ai/api/v1/chat/completions')
MODEL = os.getenv('OPENROUTER_MODEL', 'openai/gpt-oss-120b:free')

print('OPENROUTER TEST')
print('---------------')
print('API configured:', 'YES' if API_KEY else 'NO')
print('URL:', API_URL)
print('MODEL:', MODEL)

if not API_KEY:
    print('STATUS: CONFIGURATION_ERROR')
    raise SystemExit(1)

headers = {'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'}
payload = {
    'model': MODEL,
    'messages': [
        {'role': 'system', 'content': 'You are a helpful assistant.'},
        {'role': 'user', 'content': 'Say hello in one sentence.'}
    ],
    'temperature': 0.0,
    'max_tokens': 10,
}

try:
    resp = requests.post(API_URL, headers=headers, json=payload, timeout=30)
    print('STATUS CODE:', resp.status_code)
    if resp.status_code == 200:
        try:
            data = resp.json()
            print('RESULT: SUCCESS')
        except ValueError:
            print('RESULT: INVALID_JSON')
    elif resp.status_code in (401, 403):
        print('STATUS: AUTHENTICATION_ERROR')
    elif resp.status_code == 404:
        print('STATUS: MODEL_NOT_FOUND_OR_ENDPOINT')
    elif resp.status_code == 429:
        print('STATUS: RATE_LIMIT')
    elif 500 <= resp.status_code < 600:
        print('STATUS: PROVIDER_ERROR')
    else:
        print('STATUS: UNKNOWN_ERROR', resp.text[:200])
except requests.exceptions.Timeout:
    print('STATUS: NETWORK_TIMEOUT')
except requests.exceptions.RequestException as exc:
    print('STATUS: NETWORK_ERROR', str(exc))
 