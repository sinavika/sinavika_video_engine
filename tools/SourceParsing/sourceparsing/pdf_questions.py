"""Turns a question PDF into staged question records (text layer), with answers from its key and lesson hints."""
from __future__ import annotations

import re
from pathlib import Path
from typing import Callable

import fitz

from . import records
from .paths import SOURCES
from .pdf_layout import Layout, Shapes, answer_key, extract, has_figure, regions

Hint = Callable[[int, int], dict]   # (section, number) → hint


VISUAL_CUES = re.compile(r'altı çizili|numaralanmış|numaralı|harita|tablo|grafik|şekil|görsel|diyagram|kroki|koyu yazılmış|ayraç içinde|işaretli', re.I)
MATH_LESSONS = {'MAT', 'GEO'}


def needs_vision(stem: str, options: list[dict], figure: bool, hint: dict) -> bool:
    """
    Whether the question must be read from the page image to be exact: a figure, an option without text,
    formula debris, a stem that points at something the text layer loses (underlining, numbering, a map or table),
    or any mathematics question (fractions, roots and exponents are set as drawings and vanish from the text).
    """
    lessons = set(hint.get('lessonCandidates') or []) | ({hint['lessonCode']} if hint.get('lessonCode') else set())
    return (figure or any(not o['text'].strip() for o in options) or garbled(stem) or any(garbled(o['text']) for o in options)
            or bool(VISUAL_CUES.search(stem)) or bool(lessons & MATH_LESSONS))


def garbled(text: str) -> bool:
    """Text a formula left in pieces: many one-character tokens, or private-use glyphs."""
    tokens = text.split()
    if any('' <= ch <= '' for ch in text):
        return True
    return len(tokens) >= 6 and sum(len(t) == 1 for t in tokens) / len(tokens) > 0.4


def stage_pdf(file: str, *, source_id: str, categories: list[str], source: dict, hint: Hint, layout: Layout | None = None,
              key_headers: list[str] | None = None, key_pages: list[int] | None = None, key_file: str | None = None,
              sections: list[str] | None = None) -> dict:
    """Extracts, joins the key, writes STAGE/questions/<source_id>.jsonl and returns a report."""
    path = str(SOURCES / file)
    drafts, info = extract(path, layout or Layout())
    key, notes = answer_key(str(SOURCES / key_file) if key_file else path, key_pages, key_headers)
    shapes = Shapes(fitz.open(path))
    out = []
    for draft in drafts:
        answer = draft.answer or key.get((draft.section, draft.number))
        figure = has_figure(shapes, draft)
        stem = '\n'.join(draft.stem)
        question_hint = hint(draft.section, draft.number)
        warnings = list(draft.warnings)
        if not answer:
            warnings.append('cevap anahtarında yok')
        section_name = sections[draft.section] if sections and draft.section < len(sections) else None
        record = records.question(
            source={**source, 'file': file, 'page': draft.segments[0][0] + 1 if draft.segments else None, 'test': section_name},
            number=draft.number, text=stem, options=draft.options, answer=answer, categories=categories,
            hint=question_hint, has_figure=figure, region=regions(draft), warnings=warnings)
        record['needsVision'] = needs_vision(stem, draft.options, figure, question_hint)
        record['id'] = f'{source_id}-{draft.section}-{draft.number:03d}'
        out.append(record)
    count = records.write_jsonl(records.stage_file('questions', source_id), out)
    return {
        'source': source_id, 'file': file, 'questions': count, 'sections': info['sections'],
        'answered': sum(1 for r in out if r['answer']), 'needsVision': sum(1 for r in out if r['needsVision']),
        'warnings': sum(1 for r in out if r['warnings']), 'key': notes,
    }


def slug(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def source_id_of(file: str) -> str:
    return slug(Path(file).stem)
