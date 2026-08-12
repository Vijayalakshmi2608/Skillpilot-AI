"""Temporary script to test OpenRouter response with shorter prompt."""
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv('.env')

key = os.getenv('OPENROUTER_API_KEY')
if not key:
    print('No API key found')
    raise SystemExit(1)

url = 'https://openrouter.ai/api/v1/chat/completions'
headers = {
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://skillpilot-ai.example.com',
    'X-Title': 'SkillPilot AI',
}

# Short prompt to avoid timeout
payload_no_format = {
    'model': os.getenv('OPENROUTER_MODEL', 'openrouter/free'),
    'messages': [
        {'role': 'system', 'content': 'You are a test assistant. Return ONLY valid JSON with a "recommendations" array of 5 career objects, each with: careerName, matchScore, requiredSkills, topCompanies, roadmapSummary.'},
        {'role': 'user', 'content': 'Recommend 5 careers for a science student.'},
    ],
    'temperature': 0.7,
    'max_tokens': 2048,
}

payload_with_format = dict(payload_no_format)
payload_with_format['response_format'] = {'type': 'json_object'}

for name, pl in [('Without response_format', payload_no_format), ('With response_format=json_object', payload_with_format)]:
    print(f'\n=== TEST: {name} ===')
    try:
        resp = requests.post(url, headers=headers, json=pl, timeout=90)
        print('HTTP status:', resp.status_code)
        if resp.status_code != 200:
            print('Response (first 500):', resp.text[:500])
            continue
        data = resp.json()
        # Inspect structure safely
        content = ''
        if isinstance(data, dict) and isinstance(data.get('choices'), list) and data['choices']:
            ch = data['choices'][0]
            if isinstance(ch, dict) and isinstance(ch.get('message'), dict):
                content = ch['message'].get('content', '') or ''
        print('Content length:', len(content))
        print('Content preview (first 300):', repr(content[:300]))
        try:
            parsed = json.loads(content.strip().lstrip('```json').rstrip('```').strip())
            print('JSON parse: SUCCESS')
            if isinstance(parsed, dict) and 'recommendations' in parsed:
                print('Has "recommendations": YES, count:', len(parsed['recommendations']))
            else:
                print('Has "recommendations": NO, keys:', list(parsed.keys()) if isinstance(parsed, dict) else type(parsed))
        except json.JSONDecodeError as e:
            print('JSON parse FAILED:', e)
    except requests.exceptions.Timeout:
        print('REQUEST TIMED OUT (>90s)')
    except Exception as e:
        print('Error:', type(e).__name__, str(e)[:200])
