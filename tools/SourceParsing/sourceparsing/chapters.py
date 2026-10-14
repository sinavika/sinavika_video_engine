"""
Topic chapters (konu anlatımı): one PDF = one topic, as the MEB ÖERHGM KPSS chapters are.
The explanation is split into sections at its headings; the end-of-chapter test becomes questions whose
topic is the chapter's own. Staged as:
  STAGE/explanations/<id>.json   {categoryCodes, lessonCode, topicCode, title, sections [{heading, text, pages}], source}
  STAGE/questions/<id>.jsonl     the chapter test
"""
from __future__ import annotations

import json
import re

import fitz

from . import records
from .paths import SOURCES, STAGE
from .pdf_layout import Layout, Shapes, extract, has_figure, page_dict, page_lines, regions
from .pdf_questions import needs_vision

TEST_TITLE = re.compile(r'DEĞERLENDİRME\s+TESTİ|Değerlendirme\s+Testi|KONU\s+TESTİ|Konu\s+Testi', re.I)
CHAPTER_NOISE = [r'ÖZEL EĞİTİM VE REHBERLİK', r'^GENEL MÜDÜRLÜĞÜ$', r'^NOTLAR$']


def _spans(page: fitz.Page):
    for block in page_dict(page)['blocks']:
        for line in block.get('lines', []):
            spans = [s for s in line['spans'] if s['text'].strip()]
            if spans:
                yield line, spans


def _body_size(doc: fitz.Document) -> float:
    sizes: dict[int, int] = {}
    for page in doc:
        for _, spans in _spans(page):
            for span in spans:
                sizes[round(span['size'])] = sizes.get(round(span['size']), 0) + len(span['text'])
    return max(sizes, key=sizes.get) if sizes else 11


def explanation_sections(doc: fitz.Document, last_page: int, noise: list[str]) -> list[dict]:
    """Sections split at headings: short lines set bold (or larger than the body text)."""
    body = _body_size(doc)
    noise_res = [re.compile(p) for p in noise]
    sections: list[dict] = []
    current = {'heading': None, 'lines': [], 'pages': []}
    for index in range(last_page + 1):
        page = doc[index]
        height = page.rect.height
        for line, spans in _spans(page):
            text = ''.join(s['text'] for s in line['spans']).strip()
            y0 = line['bbox'][1]
            if y0 < height * 0.07 or y0 > height * 0.95 or any(p.search(text) for p in noise_res) or re.fullmatch(r'\d{1,3}', text):
                continue
            if text.isupper() and len(text) < 20 and y0 < height * 0.1:
                continue   # running lesson title
            bold = all(s['flags'] & 16 or 'Bold' in s['font'] for s in spans)
            size = max(s['size'] for s in spans)
            heading = len(text) < 90 and (bold or size >= body + 2) and not text.endswith((',', ';')) and not text.startswith(('•', '-'))
            if heading:
                if current['lines'] or current['heading']:
                    sections.append(current)
                current = {'heading': text.strip(), 'lines': [], 'pages': [index + 1]}
            else:
                current['lines'].append(text)
                if index + 1 not in current['pages']:
                    current['pages'].append(index + 1)
    sections.append(current)
    # Consecutive headings with nothing between them are one heading (titles broken over lines).
    merged: list[dict] = []
    for section in sections:
        if merged and not merged[-1]['lines'] and section['heading']:
            merged[-1]['heading'] = f"{merged[-1]['heading']} {section['heading']}".strip()
            merged[-1]['lines'] = section['lines']
            merged[-1]['pages'] = sorted(set(merged[-1]['pages'] + section['pages']))
        else:
            merged.append(section)
    return [{'heading': s['heading'], 'text': records.clean_text('\n'.join(s['lines'])), 'pages': s['pages']} for s in merged if s['lines'] or s['heading']]


def stage_chapter(file: str, *, source_id: str, categories: list[str], lesson: str, topic: str, source: dict,
                  ground_truth: list[str] | None = None, noise: list[str] | None = None) -> dict:
    path = str(SOURCES / file)
    doc = fitz.open(path)
    noise = (noise or []) + CHAPTER_NOISE
    drafts, _ = extract(path, Layout(noise=Layout().noise + noise))
    # The chapter test is the last numbered run with options; the explanation is everything before it.
    test = [d for d in drafts if d.section == drafts[-1].section] if drafts else []
    test = [d for d in test if len(d.options) >= 4 and d.segments]
    # The test opens under a title ("KONU DEĞERLENDİRME TESTİ"); an example numbered 1 earlier in the text is not part of it.
    titled = next((i for i in range(doc.page_count) if TEST_TITLE.search(doc[i].get_text())), None)
    if titled is not None and any(d.segments[0][0] >= titled for d in test):
        test = [d for d in test if d.segments[0][0] >= titled]
    elif len(test) > 1 and test[1].segments[0][0] - test[0].segments[0][0] > 1:
        test = test[1:]
    first_test_page = min((d.segments[0][0] for d in test), default=doc.page_count)
    explanation_last = first_test_page - 1 if test else doc.page_count - 1
    sections = explanation_sections(doc, explanation_last, noise)
    explanation = {
        'id': source_id, 'categoryCodes': categories, 'lessonCode': lesson, 'topicCode': topic,
        'title': source.get('title'), 'sections': sections, 'groundTruth': ground_truth or [],
        'source': {**source, 'file': file, 'pages': [1, explanation_last + 1]},
    }
    (STAGE / 'explanations').mkdir(parents=True, exist_ok=True)
    (STAGE / 'explanations' / f'{source_id}.json').write_text(json.dumps(explanation, ensure_ascii=False, indent=1), encoding='utf-8')

    key = chapter_key(doc)
    shapes = Shapes(doc)
    out = worked_examples(doc, explanation_last, source_id=source_id, categories=categories, lesson=lesson, topic=topic, source={**source, 'file': file})
    for draft in test:
        stem = '\n'.join(draft.stem)
        figure = has_figure(shapes, draft)
        answer = draft.answer or key.get(draft.number)
        record = records.question(
            source={**source, 'file': file, 'page': draft.segments[0][0] + 1 if draft.segments else None, 'test': 'konu sonu testi'},
            number=draft.number, text=stem, options=draft.options, answer=answer, categories=categories,
            hint={'lessonCode': lesson, 'topicCode': topic, 'confidence': 0.97, 'method': 'chapter-test'},
            has_figure=figure, region=regions(draft), warnings=draft.warnings + ([] if answer else ['cevap anahtarında yok']))
        record['needsVision'] = needs_vision(stem, draft.options, figure, record['hint'])
        record['id'] = f'{source_id}-{draft.number:03d}'
        out.append(record)
    records.write_jsonl(records.stage_file('questions', source_id), out)
    tests = [r for r in out if r['source']['test'] == 'konu sonu testi']
    return {'source': source_id, 'sections': len(sections), 'explanationPages': explanation_last + 1, 'testQuestions': len(tests),
            'examples': len(out) - len(tests), 'answered': sum(1 for r in out if r['answer'])}


def chapter_key(doc: fitz.Document) -> dict[int, str]:
    """The 'Cevap Anahtarı: 1)B 2)A …' line under a chapter test."""
    key: dict[int, str] = {}
    for page in doc:
        text = page.get_text()
        found = re.search(r'Cevap\s+Anahtar', text, re.I)
        at = found.start() if found else -1
        if at < 0:
            continue
        for number, letter in re.findall(r'(\d{1,3})\s*[).\-]\s*([A-E])\b', text[at:]):
            key.setdefault(int(number), letter)
    return key


EXAMPLE_START = re.compile(r'^(Örnek|ÖRNEK)\b')
EXAMPLE_ANSWER = re.compile(r'^Cevap\s*:\s*([A-E])\b')


def worked_examples(doc: fitz.Document, last_page: int, *, source_id: str, categories: list[str], lesson: str, topic: str, source: dict) -> list[dict]:
    """'Örnek' questions inside the explanation, with the 'Cevap: D' printed under them."""
    out = []
    lines = []
    for index in range(last_page + 1):
        for line in sorted(page_lines(doc[index], index), key=lambda l: (round(l.y0 / 3), l.x0)):
            lines.append(line)
    collecting, body, number = False, [], 0
    for line in lines:
        text = line.text.replace('\t', ' ').strip()
        if EXAMPLE_START.match(text):
            collecting, body = True, []
            continue
        if not collecting:
            continue
        answer = EXAMPLE_ANSWER.match(text)
        if answer:
            stem, options = _split_example(body)
            if len(options) >= 4 and stem:
                number += 1
                record = records.question(
                    source={**source, 'page': line.page + 1, 'test': 'örnek'}, number=number, text=stem, options=options,
                    answer=answer.group(1), categories=categories,
                    hint={'lessonCode': lesson, 'topicCode': topic, 'confidence': 0.97, 'method': 'chapter-example'})
                record['needsVision'] = needs_vision(stem, options, False, record['hint'])
                record['id'] = f'{source_id}-ornek-{number:02d}'
                out.append(record)
            collecting = False
            continue
        body.append(text)
        if len(body) > 60:
            collecting = False
    return out


def _split_example(body: list[str]) -> tuple[str, list[dict]]:
    """Stem lines, then options written one per line or several on a line ('A) Erzurum   B) Malatya')."""
    text = '\n'.join(body)
    first = re.search(r'(?:^|\s)A\s*\)', text)
    if not first:
        return text, []
    stem, rest = text[:first.start()], text[first.start():]
    parts = re.split(r'(?:^|\s)([A-E])\s*\)\s*', rest)
    letters, values = parts[1::2], parts[2::2]
    if ''.join(letters) not in ('ABCDE', 'ABCD'):
        return text, []
    return stem.strip(), [{'key': k, 'text': v.strip()} for k, v in zip(letters, values)]
