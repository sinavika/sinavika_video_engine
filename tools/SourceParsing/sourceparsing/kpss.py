"""
KPSS sources: ÖSYM GY-GK booklets, the other question PDFs, the MEB ÖERHGM topic chapters,
the ReferenceCorpus copies and Sinavika's own question bank, staged for coding.
"""
from __future__ import annotations

import json
import re

from .paths import SOURCE_MANIFEST
from .pdf_questions import source_id_of, stage_pdf

LISANS = ['KPSS_LISANS']
ONLISANS = ['KPSS_ONLISANS']
ORTAOGRETIM = ['KPSS_ORTAOGRETIM']


def manifest() -> dict:
    return json.loads(SOURCE_MANIFEST.read_text(encoding='utf-8'))


def kpss_files(kind: str) -> list[dict]:
    folder = 'KonuAnlatimi' if kind == 'kn' else 'Sorular'
    return [f for f in manifest()['files'] if f['file'].startswith('KPSS/') and f'/{folder}/' in f['file']]


def categories_of(file: str) -> list[str]:
    name = file.lower()
    if '/lisans/' in name:
        return LISANS
    if 'ortaogretim.pdf' in name or 'ortaogretim-' in name.split('_sr_')[-1]:
        return ORTAOGRETIM
    if name.endswith('-onlisans.pdf') or 'osym-onlisans' in name:
        return ONLISANS
    return ONLISANS + ORTAOGRETIM


# ---------------------------------------------------------------- ÖSYM GY-GK booklets

def osym_year(file: str) -> int | None:
    match = re.search(r'osym-(\d{4})', file)
    return int(match.group(1)) if match else None


def osym_hint(year: int | None):
    """
    Lesson by position. Genel Yetenek: 1–30 Türkçe, 31–60 Matematik (geometry among them).
    Genel Kültür since 2013: 1–27 Tarih, 28–45 Coğrafya, 46–54 Vatandaşlık, 55–60 Güncel Bilgiler (under Vatandaşlık).
    Older Genel Kültür booklets mixed the order, so only the candidate lessons are given.
    """
    def hint(section: int, number: int) -> dict:
        if section == 0:
            if number <= 30:
                return {'lessonCode': 'TRK', 'confidence': 0.98, 'method': 'osym-position'}
            return {'lessonCode': 'MAT', 'lessonCandidates': ['MAT', 'GEO'], 'confidence': 0.7, 'method': 'osym-position'}
        if year and year >= 2013:
            if number <= 27:
                return {'lessonCode': 'TAR', 'confidence': 0.97, 'method': 'osym-position'}
            if number <= 45:
                return {'lessonCode': 'COG', 'confidence': 0.97, 'method': 'osym-position'}
            if number <= 54:
                return {'lessonCode': 'VAT', 'confidence': 0.95, 'method': 'osym-position'}
            return {'lessonCode': 'VAT', 'topicCode': 'VAT_GUNCEL_BILGILER', 'confidence': 0.9, 'method': 'osym-position'}
        return {'lessonCandidates': ['TAR', 'COG', 'VAT'], 'confidence': 0.0, 'method': 'osym-section'}
    return hint


def osym_title(file: str, categories: list[str]) -> str:
    level = {'KPSS_LISANS': 'Lisans', 'KPSS_ONLISANS': 'Önlisans', 'KPSS_ORTAOGRETIM': 'Ortaöğretim'}[categories[0]]
    year = osym_year(file)
    return f'ÖSYM KPSS {level} GY-GK {year or "(yıl belirtilmemiş)"}'


# 2022 and later releases carry only the first question as text; the rest is drawn and is read from page images.
def osym_text_layer(file: str) -> bool:
    year = osym_year(file)
    return not year or year < 2022


def stage_osym(report=print) -> list[dict]:
    results = []
    for entry in kpss_files('sr'):
        file = entry['file']
        if '_osym-' not in file or not osym_text_layer(file):
            continue
        categories = categories_of(file)
        result = stage_pdf(
            file, source_id=source_id_of(file), categories=categories,
            source={'kind': 'pdf', 'title': osym_title(file, categories), 'publisher': 'ÖSYM', 'year': osym_year(file),
                    'license': 'osym-reference-only'},
            hint=osym_hint(osym_year(file)), key_headers=['GENEL YETENEK', 'GENEL KÜLTÜR'], sections=['GY', 'GK'])
        report(f"  {file.split('/')[-1]}: {result['questions']} soru, {result['answered']} cevaplı, {result['needsVision']} görsel okuma gerekiyor")
        results.append(result)
    return results


# ---------------------------------------------------------------- MEB ÖERHGM topic chapters

def chapter_topics() -> dict[tuple[str, str], list[dict]]:
    """(chapter PDF, category) → the ReferenceCorpus packs made from it (they carry the lesson-list topic)."""
    data = manifest()
    by_original = {}
    for entry in data['files']:
        if entry['file'].startswith('KPSS/') and '/KonuAnlatimi/' in entry['file']:
            original = entry['original'].replace(chr(92), '/')
            name = original.split('/')[-1].lower()
            folder = original.split('/')[-2].lower() if '/' in original else ''
            by_original[(folder, name)] = entry['file']
    topics: dict[tuple[str, str], list[dict]] = {}
    for pack in data['corpusFiles']:
        if not pack['file'].startswith('KPSS/') or pack['kind'] != 'konu-anlatimi':
            continue
        category = 'KPSS_LISANS' if pack['file'].startswith('KPSS/Lisans/') else 'KPSS_ONLISANS'
        file = pack.get('sourcePdfFile')
        if not file:
            folder, name = pack['sourcePdf'].lower().split('/')[-2:]
            file = by_original.get((folder, name))
        if file:
            topics.setdefault((file, category), []).append(pack)
    return topics


def stage_chapters(report=print) -> list[dict]:
    from . import lessons
    from .chapters import stage_chapter
    results = []
    for (file, category), packs in sorted(chapter_topics().items()):
        categories = LISANS if category == 'KPSS_LISANS' else ONLISANS + ORTAOGRETIM
        codes = []
        for pack in packs:
            lesson, topic, _ = lessons.validate(category, pack['lessonCode'], pack['topicCode'])
            if lesson and topic and (lesson, topic) not in codes:
                codes.append((lesson, topic))
        if not codes:
            report(f'  {file}: konu kodu ders listesinde yok ({[p["topicCode"] for p in packs]})')
            continue
        lesson, topic = codes[0]
        source_id = source_id_of(file) + ('-lisans' if category == 'KPSS_LISANS' and '/Lisans/' not in file else '')
        result = stage_chapter(
            file, source_id=source_id, categories=categories, lesson=lesson, topic=topic,
            source={'kind': 'pdf', 'title': packs[0].get('topicName'), 'publisher': 'MEB ÖERHGM', 'license': 'meb-open-material'},
            ground_truth=[p['file'] for p in packs])
        if len(codes) > 1:
            result['otherTopics'] = codes[1:]
        report(f"  {file.split('/')[-1]} → {lesson}/{topic}: {result['sections']} bölüm, test {result['testQuestions']} soru ({result['answered']} cevaplı)")
        results.append(result)
    return results


# ---------------------------------------------------------------- everything

def vision_sources() -> list[str]:
    """Question PDFs whose text layer does not carry the questions well: read from page images (needs the API)."""
    files = []
    for entry in kpss_files('sr'):
        file = entry['file']
        if '_osym-' in file and osym_text_layer(file):
            continue
        if file.endswith(('_cevap.pdf',)):
            continue   # answer keys only: read together with their booklet
        files.append(file)
    return files


def stage_all(report=print) -> None:
    from .bank import stage_bank
    report('ÖSYM kitapçıkları')
    stage_osym(report)
    report('MEB konu bölümleri')
    stage_chapters(lambda line: None)
    report('Sınavika soru bankası')
    stage_bank('KPSS', report)
    pending = vision_sources()
    report(f'Sayfa görüntüsünden okunacak PDF: {len(pending)}')
    for file in pending:
        report(f'  {file}')


# ---------------------------------------------------------------- page images (needs the API)

FILE_LESSONS = {'turkce': 'TRK', 'matematik': 'MAT', 'geometri': 'GEO', 'tarih': 'TAR', 'cografya': 'COG', 'vatandaslik': 'VAT'}


def read_with_vision(report=print) -> None:
    from . import vision
    report('Soru bölgeleri (şekil, formül, altı çizili)')
    vision.read_regions('kpss', ('kpss-',), report)
    for file in vision_sources():
        source_id = source_id_of(file)
        if (vision.STAGE / 'questions' / f'{source_id}.jsonl').exists() and (vision.STAGE / 'vision' / 'pages' / f'{source_id}.json').exists():
            continue
        lesson = FILE_LESSONS.get(file.split('_sr_')[-1].split('_')[0])
        hint = {'lessonCode': lesson, 'confidence': 0.9, 'method': 'file-lesson'} if lesson else {'lessonCandidates': ['TRK', 'MAT', 'GEO', 'TAR', 'COG', 'VAT'], 'confidence': 0.0, 'method': 'file-mixed'}
        if lesson == 'MAT':
            hint['lessonCandidates'] = ['MAT', 'GEO']
        categories = categories_of(file)
        publisher = 'ÖSYM' if '_osym-' in file else None
        title = osym_title(file, categories) if publisher else file.split('_sr_')[-1].rsplit('.', 1)[0]
        report(f'  sayfa okuma: {file}')
        result = vision.read_pages(file, source_id=source_id, categories=categories,
                                   source={'kind': 'pdf', 'title': title, 'publisher': publisher, 'year': osym_year(file),
                                           'license': 'osym-reference-only' if publisher else 'publisher-reference-only'},
                                   hint=hint, report=report)
        report(f"    {result['questions']} soru, {result['answered']} cevaplı")
