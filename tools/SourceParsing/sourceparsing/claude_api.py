"""
Minimal Claude Messages API client: single calls and message batches (half price, for bulk coding).
The Anthropic key is ANTHROPIC_API_KEY, from the environment or the video engine's git-ignored .env; it is never logged or written.
"""
from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from functools import lru_cache

from .paths import REPO

API = 'https://api.anthropic.com/v1'
VERSION = '2023-06-01'
FAST_MODEL = 'claude-haiku-5-5'      # bulk coding
CAREFUL_MODEL = 'claude-sonnet-5-5'  # second opinion, page reading


@lru_cache(maxsize=1)
def _key() -> str:
    if os.environ.get('ANTHROPIC_API_KEY'):
        return os.environ['ANTHROPIC_API_KEY'].strip()
    env = REPO / '.env'
    if env.exists():
        for line in env.read_text(encoding='utf-8').splitlines():
            name, _, value = line.partition('=')
            if name.strip() == 'ANTHROPIC_API_KEY' and value.strip():
                return value.strip().strip('"').strip("'")
    raise RuntimeError('ANTHROPIC_API_KEY is not set (environment or .env).')


def available() -> bool:
    try:
        _key()
        return True
    except RuntimeError:
        return False


def _request(method: str, path: str, body: dict | None = None, raw: bool = False, retries: int = 5):
    data = json.dumps(body).encode('utf-8') if body is not None else None
    for attempt in range(retries):
        request = urllib.request.Request(API + path if path.startswith('/') else path, data=data, method=method, headers={
            'x-api-key': _key(), 'anthropic-version': VERSION, 'content-type': 'application/json'})
        try:
            with urllib.request.urlopen(request, timeout=600) as response:
                payload = response.read()
                return payload if raw else json.loads(payload)
        except urllib.error.HTTPError as error:
            detail = error.read().decode('utf-8', 'replace')[:500]
            if error.code in (429, 500, 502, 503, 529) and attempt < retries - 1:
                time.sleep(min(60, 4 * 2 ** attempt))
                continue
            raise RuntimeError(f'Claude API {error.code}: {detail}') from None
        except (urllib.error.URLError, TimeoutError):
            if attempt < retries - 1:
                time.sleep(min(60, 4 * 2 ** attempt))
                continue
            raise


def message(params: dict) -> dict:
    return _request('POST', '/messages', params)


def text_of(response: dict) -> str:
    return ''.join(block.get('text', '') for block in response.get('content', []) if block.get('type') == 'text')


def models() -> list[str]:
    return [m['id'] for m in _request('GET', '/models?limit=100')['data']]


# ---------------------------------------------------------------- batches

def submit_batch(requests: list[dict]) -> str:
    """requests: [{custom_id, params}] → batch id."""
    return _request('POST', '/messages/batches', {'requests': requests})['id']


def batch_status(batch_id: str) -> dict:
    return _request('GET', f'/messages/batches/{batch_id}')


def batch_results(batch_id: str) -> list[dict]:
    status = batch_status(batch_id)
    payload = _request('GET', status['results_url'], raw=True)
    return [json.loads(line) for line in payload.decode('utf-8').splitlines() if line.strip()]


def wait_batch(batch_id: str, poll: int = 30, report=print) -> dict:
    while True:
        status = batch_status(batch_id)
        counts = status.get('request_counts', {})
        report(f'  batch {batch_id[-8:]}: {status["processing_status"]} {counts}')
        if status['processing_status'] == 'ended':
            return status
        time.sleep(poll)
