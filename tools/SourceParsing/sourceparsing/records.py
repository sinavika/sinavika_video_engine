"""
Question and explanation records, and the stage files they pass through.

A staged question (before coding):
  id                 stable hash of the normalized stem and options
  categoryCodes      lesson-list categories it belongs to (KPSS_ONLISANS and/or KPSS_ORTAOGRETIM share one folder)
  number, question, options [{key, text}], answer, solution
  hasFigure          the question has a drawing, map, table image or formula the text cannot carry
  region             where it is in the PDF: [{page, bbox}] (for rendering a crop later)
  source             {kind: pdf|referencecorpus|sinavika-bank, file, page, title, year, license}
  hint               what the source itself says about its lesson/topic: {lessonCode, topicCode, mikroCode, confidence, method}
  warnings           extraction problems worth a look

The library adds lessonMainCode, lessonSubCode, lessonMikroCode, match {method, confidence, needsReview} and usedForVideo.
"""
from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from pathlib import Path
from typing import Iterable, Iterator

from .paths import STAGE

_TR_LOWER = str.maketrans({'I': 'ı', 'İ': 'i'})


def normalize(text: str) -> str:
    """Lowercase letters and digits only, for duplicate detection."""
    text = unicodedata.normalize('NFKC', text or '').translate(_TR_LOWER).lower()
    return re.sub(r'[^0-9a-zçğıöşüâîû]+', '', text)


def question_id(question: str, options: Iterable[dict]) -> str:
    key = normalize(question) + '|' + '|'.join(normalize(option.get('text', '')) for option in options)
    return hashlib.sha1(key.encode('utf-8')).hexdigest()[:16]


def clean_text(text: str) -> str:
    """Joins PDF lines into readable text: hyphenated line ends rejoined, runs of spaces collapsed."""
    text = unicodedata.normalize('NFC', text or '').replace('­', '').replace('\xa0', ' ')
    text = re.sub(r'(\w)-\n(\w)', r'\1\2', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r' *\n *', '\n', text)
    return text.strip()


def question(*, source: dict, number: int | None, text: str, options: list[dict], answer: str | None,
             categories: list[str], hint: dict | None = None, solution: str | None = None, has_figure: bool = False,
             region: list[dict] | None = None, warnings: list[str] | None = None) -> dict:
    options = [{'key': o['key'], 'text': clean_text(o['text'])} for o in options]
    text = clean_text(text)
    return {
        'id': question_id(text, options),
        'categoryCodes': categories,
        'number': number,
        'question': text,
        'options': options,
        'answer': answer,
        'solution': clean_text(solution) if solution else None,
        'hasFigure': has_figure,
        'region': region or [],
        'source': source,
        'hint': hint or {},
        'warnings': warnings or [],
    }


# ---------------------------------------------------------------- stage files

def stage_file(kind: str, source_id: str) -> Path:
    return STAGE / kind / f'{source_id}.jsonl'


def write_jsonl(path: Path, records: Iterable[dict]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with path.open('w', encoding='utf-8') as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False) + '\n')
            count += 1
    return count


def read_jsonl(path: Path) -> Iterator[dict]:
    if not path.exists():
        return
    with path.open(encoding='utf-8') as handle:
        for line in handle:
            if line.strip():
                yield json.loads(line)


def staged(kind: str, prefix: str = '') -> Iterator[dict]:
    for path in sorted((STAGE / kind).glob(f'{prefix}*.jsonl')):
        yield from read_jsonl(path)
