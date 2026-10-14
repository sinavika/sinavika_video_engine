"""
Reading from page images, for what the text layer cannot carry.

regions  questions already found by layout whose figure, formula or underlining was lost: the question's area is
         cropped from the PDF (kept in Library/_Figures for video use too) and transcribed exactly, formulas in LaTeX.
         Results: STAGE/vision/<exam>-regions.jsonl ({id, question, options, figure}), applied by the build.
pages    question PDFs whose layout the text parser cannot follow (slides, solution books, drawn ÖSYM releases):
         every page image is read into questions; questions running over a page are joined; answer keys found on
         any page are applied. Results: STAGE/questions/<source>.jsonl like any other source.

Both go through message batches with the careful model.
"""
from __future__ import annotations

import base64
import json
import re
from pathlib import Path

import fitz

from . import claude_api, records
from .paths import LIBRARY, SOURCES, STAGE

FIGURES = LIBRARY / '_Figures'
ZOOM = 2.0          # 144 dpi: small print and exponents stay legible
MAX_BATCH_BYTES = 180 * 1024 * 1024

REGION_PROMPT = """Görüntü, bir sınav kitapçığından kesilmiş tek bir çoktan seçmeli sorudur. Altta, aynı sorunun PDF'ten çıkarılmış (eksik ya da bozuk olabilen) metni var.
Görevin soruyu görüntüden AYNEN yazıya geçirmek:
- Soru kökünü, öncülleri (I., II., …), şıkları eksiksiz ve kelimesi kelimesine yaz; düzeltme, yorum, çözüm ekleme.
- Matematik ifadelerini LaTeX olarak $...$ içinde yaz (ör. $\\frac{2}{3}$, $x^2$, $\\sqrt{5}$).
- Altı çizili ifadeleri <u>...</u>, kalın yazılanları <b>...</b> ile işaretle.
- Şekil, grafik, harita, tablo varsa: tabloyu Markdown tablo olarak yaz; diğerlerini figure alanında Türkçe, soruyu çözmeye yetecek ayrıntıda betimle (ölçüler, etiketler, işaretli noktalar).
Yanıt yalnızca JSON olsun:
{"question": "...", "options": {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}, "figure": null veya "betimleme", "legible": true/false}

PDF metni:
"""

PAGE_PROMPT = """Görüntü, bir sınav/soru kitabının bir sayfasıdır. Sayfadaki çoktan seçmeli soruları AYNEN yazıya geçir.
- Her soru için: numara, kök (öncüller dahil), şıklar. Kelimesi kelimesine; düzeltme ya da çözüm ekleme.
- Matematik ifadeleri LaTeX olarak $...$ içinde; altı çizili <u>...</u>; kalın <b>...</b>.
- Şekil/grafik/harita varsa figure alanında Türkçe ve çözmeye yetecek ayrıntıda betimle; tabloyu Markdown tablo olarak yaz.
- Sayfada sorunun cevabı/çözümü yazıyorsa (ör. "Cevap: C", "ÇÖZÜM ...") answer ve solution alanlarına koy.
- Sayfanın başında önceki sayfadan devam eden bir soru parçası varsa continuesPrevious: true ile ayrı bir öğe olarak ver.
- Sayfanın sonunda yarım kalan soru varsa continuesNext: true işaretle.
- Sayfada cevap anahtarı tablosu varsa answerKey alanına {"1": "B", ...} biçiminde yaz (bölüm/test adı varsa section alanında).
- Soru yoksa (kapak, içindekiler, açıklama sayfası) questions boş liste olsun.
Yanıt yalnızca JSON olsun:
{"questions": [{"number": 1, "question": "...", "options": {"A": "...", ...}, "figure": null, "answer": null, "solution": null, "continuesPrevious": false, "continuesNext": false}],
 "answerKey": null, "section": null, "pageKind": "sorular|cozumler|anahtar|diger"}"""


def _png(page: fitz.Page, clip: fitz.Rect | None = None) -> bytes:
    return page.get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM), clip=clip, alpha=False).tobytes('png')


def _image_block(png: bytes) -> dict:
    return {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/png', 'data': base64.b64encode(png).decode('ascii')}}


def _json(text: str) -> dict:
    match = re.search(r'\{.*\}', text, re.S)
    if not match:
        return {}
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return {}


def crop(question: dict) -> list[tuple[str, bytes]]:
    """The question's area on each page it covers, a little wider than its text; saved under Library/_Figures."""
    doc = fitz.open(str(SOURCES / question['source']['file']))
    out = []
    for index, part in enumerate(question.get('region') or []):
        page = doc[part['page'] - 1]
        x0, y0, x1, y1 = part['bbox']
        clip = fitz.Rect(x0 - 12, y0 - 6, x1 + 12, y1 + 8) & page.rect
        png = _png(page, clip)
        name = f"{question['id']}{'' if index == 0 else f'-{index + 1}'}.png"
        path = FIGURES / re.sub(r'-\d+-\d{3}$|-\d{3}$', '', question['id']) / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(png)
        out.append((str(path.relative_to(LIBRARY)).replace('\\', '/'), png))
    return out


def _submit_all(requests: list[tuple[dict, int]], report) -> dict[str, dict]:
    """Requests with their payload sizes, sent in batches under the size limit; returns custom_id → message."""
    results: dict[str, dict] = {}
    chunk, size = [], 0
    def flush():
        if not chunk:
            return
        batch_id = claude_api.submit_batch(chunk)
        report(f'  {len(chunk)} istek gönderildi ({batch_id})')
        claude_api.wait_batch(batch_id, report=report)
        for item in claude_api.batch_results(batch_id):
            if item['result']['type'] == 'succeeded':
                results[item['custom_id']] = item['result']['message']
    for request, bytes_ in requests:
        if chunk and (size + bytes_ > MAX_BATCH_BYTES or len(chunk) >= 2000):
            flush()
            chunk, size = [], 0
        chunk.append(request)
        size += bytes_
    flush()
    return results


# ---------------------------------------------------------------- regions

def read_regions(exam: str, prefixes: tuple[str, ...], report=print) -> int:
    out_file = STAGE / 'vision' / f'{exam.lower()}-regions.jsonl'
    done = {r['id'] for r in records.read_jsonl(out_file)}
    questions = [q for path in sorted((STAGE / 'questions').glob('*.jsonl')) if path.stem.startswith(prefixes)
                 for q in records.read_jsonl(path) if q.get('needsVision') and q.get('region') and q['id'] not in done]
    report(f'  bölgesinden okunacak soru: {len(questions)}')
    requests, crops = [], {}
    for question in questions:
        images = crop(question)
        crops[question['id']] = [p for p, _ in images]
        text = question['question'] + '\n' + '\n'.join(f"{o['key']}) {o['text']}" for o in question['options'])
        content = [_image_block(png) for _, png in images] + [{'type': 'text', 'text': REGION_PROMPT + text}]
        custom_id = re.sub(r'[^a-zA-Z0-9_-]', '_', question['id'])[:64]
        requests.append(({'custom_id': custom_id, 'params': {'model': claude_api.CAREFUL_MODEL, 'max_tokens': 2000,
                                                             'messages': [{'role': 'user', 'content': content}]}},
                         sum(len(png) for _, png in images) * 4 // 3 + 4000))
    if not requests:
        return 0
    answers = _submit_all(requests, report)
    items = []
    for question in questions:
        message = answers.get(re.sub(r'[^a-zA-Z0-9_-]', '_', question['id'])[:64])
        data = _json(claude_api.text_of(message)) if message else {}
        options = data.get('options') or {}
        if not data.get('question') or len(options) < 4:
            continue
        items.append({'id': question['id'], 'question': data['question'], 'options': [{'key': k, 'text': v} for k, v in sorted(options.items())],
                      'figure': data.get('figure'), 'figureImages': crops[question['id']], 'legible': data.get('legible', True)})
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with out_file.open('a', encoding='utf-8') as handle:
        for item in items:
            handle.write(json.dumps(item, ensure_ascii=False) + '\n')
    report(f'  okunan: {len(items)} / {len(questions)}')
    return len(items)


def region_overlay(exam: str) -> dict[str, dict]:
    return {r['id']: r for r in records.read_jsonl(STAGE / 'vision' / f'{exam.lower()}-regions.jsonl')}


# ---------------------------------------------------------------- whole pages

def read_pages(file: str, *, source_id: str, categories: list[str], source: dict, hint: dict, report=print) -> dict:
    doc = fitz.open(str(SOURCES / file))
    requests = []
    for index in range(doc.page_count):
        png = _png(doc[index])
        content = [_image_block(png), {'type': 'text', 'text': PAGE_PROMPT}]
        requests.append(({'custom_id': f'p{index + 1:04d}', 'params': {'model': claude_api.CAREFUL_MODEL, 'max_tokens': 8000,
                                                                     'messages': [{'role': 'user', 'content': content}]}},
                         len(png) * 4 // 3 + 4000))
    answers = _submit_all(requests, report)
    raw_file = STAGE / 'vision' / 'pages' / f'{source_id}.json'
    raw_file.parent.mkdir(parents=True, exist_ok=True)
    pages = {cid: _json(claude_api.text_of(message)) for cid, message in answers.items()}
    raw_file.write_text(json.dumps(pages, ensure_ascii=False, indent=1), encoding='utf-8')
    return stage_pages(file, pages, source_id=source_id, categories=categories, source=source, hint=hint)


def stage_pages(file: str, pages: dict[str, dict], *, source_id: str, categories: list[str], source: dict, hint: dict) -> dict:
    """Joins page readings: continued questions are merged, answer keys applied by number within their section."""
    questions: list[dict] = []
    keys: dict[str, dict[int, str]] = {}
    section = None
    for cid in sorted(pages):
        page = pages[cid] or {}
        page_number = int(cid[1:])
        if page.get('section'):
            section = page['section']
        if page.get('answerKey'):
            keys.setdefault(page.get('section') or section or '', {}).update({int(k): v for k, v in page['answerKey'].items() if str(k).isdigit() and v in 'ABCDE'})
        for item in page.get('questions') or []:
            if item.get('continuesPrevious') and questions and questions[-1].get('_open'):
                last = questions[-1]
                last['question'] += '\n' + (item.get('question') or '')
                for key, value in (item.get('options') or {}).items():
                    last['options'][key] = (last['options'].get(key, '') + ' ' + value).strip()
                last['_open'] = bool(item.get('continuesNext'))
                last['answer'] = last.get('answer') or item.get('answer')
                last['solution'] = last.get('solution') or item.get('solution')
                continue
            questions.append({'number': item.get('number'), 'question': item.get('question') or '', 'options': dict(item.get('options') or {}),
                              'figure': item.get('figure'), 'answer': item.get('answer'), 'solution': item.get('solution'),
                              'page': page_number, 'section': section, '_open': bool(item.get('continuesNext'))})
    out = []
    seen: set[tuple] = set()
    for index, item in enumerate(questions):
        if len(item['options']) < 4 or not item['question'].strip():
            continue
        number = item['number'] if isinstance(item['number'], int) else None
        key = keys.get(item['section'] or '', {}) or (keys.get('', {}) if len(keys) <= 1 else {})
        answer = item['answer'] if item['answer'] in ('A', 'B', 'C', 'D', 'E') else key.get(number)
        record = records.question(
            source={**source, 'file': file, 'page': item['page'], 'test': item['section']}, number=number,
            text=item['question'], options=[{'key': k, 'text': v} for k, v in sorted(item['options'].items())],
            answer=answer, categories=categories, hint=hint, solution=item['solution'], has_figure=bool(item['figure']),
            warnings=[] if answer else ['cevap bulunamadı'])
        record['figure'] = item['figure']
        record['needsVision'] = False
        record['visionRead'] = True
        record['id'] = f'{source_id}-p{item["page"]:03d}-{index:04d}'
        signature = (record['question'][:120], tuple(o['text'][:40] for o in record['options']))
        if signature in seen:
            continue   # the same question printed twice (e.g. once in the test, once in the solutions)
        seen.add(signature)
        out.append(record)
    records.write_jsonl(records.stage_file('questions', source_id), out)
    return {'source': source_id, 'questions': len(out), 'answered': sum(1 for r in out if r['answer'])}
