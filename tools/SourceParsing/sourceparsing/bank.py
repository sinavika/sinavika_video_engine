"""
Sinavika's own question bank (Veri/SORULAR.csv, an export of the app's questions), staged per category.

Columns (semicolon-separated, no header): exam, exam name, category, category name, lesson code, lesson name,
topic code, topic name, subtopic code, subtopic name, booklet code, booklet name, number, id, question code,
question, (image), (1), options A–E, answer, answer text, 'Çözüm özeti', solution.

Codes that exist in the lesson list are kept as they are. Codes from an older KPSS list (GB_*, COG_IKLIM_BITKI …)
keep their lesson where it still exists and carry the old topic name as a hint; Güncel Bilgiler (GB) is under
Vatandaşlık now. Uncoded questions get their lesson from the question code's prefix.
"""
from __future__ import annotations

import csv
import re

from . import lessons, records
from .paths import SOURCES

BANK = SOURCES / 'Veri' / 'SORULAR.csv'

# The question code starts with the lesson (TAR531190, GEO775492); on coded questions it always matches the coded lesson,
# while booklet names do not (a "Vatandaşlık Branş" booklet also has history and geography questions).
CODE_LESSONS = {'TRK': 'TRK', 'MAT': 'MAT', 'GEO': 'GEO', 'TAR': 'TAR', 'COG': 'COG', 'VAT': 'VAT', 'GBX': 'VAT'}


def _hint(category: str, row: list[str]) -> dict:
    lesson_code, topic_code, mikro_code = (None if v == 'NULL' else v for v in (row[4], row[6], row[8]))
    booklet = row[11]
    if lesson_code:
        if lesson_code == 'GB':
            return {'lessonCode': 'VAT', 'topicCode': 'VAT_GUNCEL_BILGILER', 'confidence': 0.9, 'method': 'sinavika-bank-old-code',
                    'oldCodes': [lesson_code, topic_code, mikro_code], 'oldNames': [row[7], row[9]]}
        valid = lessons.validate(category, lesson_code, topic_code, mikro_code)
        if valid == (lesson_code, topic_code, mikro_code):
            return {'lessonCode': lesson_code, 'topicCode': topic_code, 'mikroCode': mikro_code, 'confidence': 1.0, 'method': 'sinavika-bank'}
        if valid[0]:
            return {'lessonCode': valid[0], 'topicCode': valid[1], 'confidence': 0.6, 'method': 'sinavika-bank-old-code',
                    'oldCodes': [lesson_code, topic_code, mikro_code], 'oldNames': [row[7], row[9]]}
    prefix = re.match(r'[A-Z]+', row[14] or '')
    lesson = CODE_LESSONS.get(prefix.group(0)) if prefix else None
    if lesson and lessons.lesson(category, lesson):
        hint = {'lessonCode': lesson, 'confidence': 0.95, 'method': 'bank-question-code', 'booklet': booklet}
        if prefix.group(0) == 'GBX':
            hint['topicCode'] = 'VAT_GUNCEL_BILGILER'
        return hint
    return {'confidence': 0.0, 'method': 'bank-booklet', 'booklet': booklet}


def rows(exam_prefix: str):
    csv.field_size_limit(10 ** 9)
    with BANK.open(encoding='utf-8-sig', newline='') as handle:
        for row in csv.reader(handle, delimiter=';'):
            if len(row) == 27 and row[2].startswith(exam_prefix):
                yield row


def stage_bank(exam_prefix: str, report=print) -> list[dict]:
    """exam_prefix: 'KPSS', 'YKS'. One stage file per category."""
    by_category: dict[str, list[dict]] = {}
    for row in rows(exam_prefix):
        category = row[2]
        options = [{'key': k, 'text': v} for k, v in zip('ABCDE', row[18:23]) if v and v != 'NULL']
        record = records.question(
            source={'kind': 'sinavika-bank', 'file': 'Veri/SORULAR.csv', 'title': row[11], 'booklet': row[10],
                    'questionCode': row[14], 'bankId': row[13], 'license': 'sinavika'},
            number=int(row[12]) if row[12].isdigit() else None, text=row[15], options=options,
            answer=row[23] if row[23] in 'ABCDE' and row[23] else None, categories=[category],
            hint=_hint(category, row), solution=None if row[26] == 'NULL' else row[26])
        record['id'] = 'bank-' + row[13].lower()
        record['needsVision'] = False
        by_category.setdefault(category, []).append(record)
    results = []
    for category, items in sorted(by_category.items()):
        count = records.write_jsonl(records.stage_file('questions', f'bank-{category.lower()}'), items)
        methods: dict[str, int] = {}
        for item in items:
            methods[item['hint']['method'] + ('+topic' if item['hint'].get('topicCode') else '')] = methods.get(item['hint']['method'] + ('+topic' if item['hint'].get('topicCode') else ''), 0) + 1
        report(f'  bank {category}: {count} soru {methods}')
        results.append({'source': f'bank-{category.lower()}', 'questions': count, 'methods': methods})
    return results
