"""
Writes the coded library from the stage and the coding decisions:

  Curriculum/Library/<Sınav>/<Kategori>/
    Sorular/<LESSON>/<TOPIC>.jsonl          questions coded to a topic (and subtopic where known)
    Sorular/<LESSON>/_KonuBekliyor.jsonl    lesson known, topic not decided yet
    Sorular/_DersBekliyor.jsonl             lesson not decided yet
    Sorular/_GorselOkumaBekliyor.jsonl      figures/formulas the text layer cannot carry, waiting for page reading
    KonuAnlatimi/<LESSON>/<TOPIC>.json      explanations (chapter sections) and the knowledge packs of the topic
  Curriculum/Library/Index.json, Rapor.md   coverage per topic

Every item has usedForVideo: false; a true set by production is kept across rebuilds.
Identical questions from several sources are kept once, with the other sources under alsoIn.
"""
from __future__ import annotations

import json
import shutil
from collections import Counter, defaultdict
from pathlib import Path

from . import lessons, records
from .coding import load_decisions, staged_questions
from .paths import LIBRARY, SOURCES, STAGE

EXAM_FOLDERS = {'KPSS': ['KPSS/Lisans', 'KPSS/OnlisansOrtaogretim'], 'YKS': ['YKS/TYT', 'YKS/AYT', 'YKS/YDT'], 'ABD': ['ABD']}


def _used_for_video(folders: list[str]) -> set[str]:
    used = set()
    for folder in folders:
        for path in (LIBRARY / folder).rglob('*.json*'):
            if path.suffix == '.jsonl':
                for record in records.read_jsonl(path):
                    if record.get('usedForVideo'):
                        used.add(record['id'])
            else:
                data = json.loads(path.read_text(encoding='utf-8'))
                if data.get('usedForVideo'):
                    used.add(data.get('id', str(path)))
    return used


def final_codes(question: dict, decision: dict | None) -> tuple[str | None, str | None, str | None, dict]:
    category = question['categoryCodes'][0]
    if decision and decision.get('lesson'):
        match = {k: decision[k] for k in ('method', 'confidence', 'needsReview') if k in decision}
        for extra in ('reason', 'alternatives', 'model'):
            if decision.get(extra):
                match[extra] = decision[extra]
        return decision['lesson'], decision.get('topic'), decision.get('mikro'), match
    hint = question.get('hint') or {}
    lesson, topic, _ = lessons.validate(category, hint.get('lessonCode'), hint.get('topicCode'))
    confident = hint.get('confidence', 0) >= 0.9 and not hint.get('lessonCandidates')
    lesson = lesson if confident or hint.get('confidence', 0) >= 0.7 else None
    topic = topic if lesson and confident else None
    return lesson, topic, None, {'method': f"kaynak ipucu ({hint.get('method', '-')})", 'confidence': hint.get('confidence', 0), 'needsReview': True, 'pending': True}


def build(exam: str, report=print) -> dict:
    exam = exam.upper()
    folders = EXAM_FOLDERS[exam]
    used = _used_for_video(folders)
    decisions = load_decisions(exam)

    # Identical questions from several sources: one record, the others under alsoIn.
    merged: dict[str, dict] = {}
    for question in staged_questions(exam):
        content = records.question_id(question['question'], question['options'])
        if content in merged:
            first = merged[content]
            first.setdefault('alsoIn', []).append({**question['source'], 'id': question['id']})
            first['categoryCodes'] = sorted(set(first['categoryCodes']) | set(question['categoryCodes']))
            if not first.get('answer') and question.get('answer'):
                first['answer'] = question['answer']
            continue
        merged[content] = dict(question)

    outputs: dict[Path, list[dict]] = defaultdict(list)
    stats = Counter()
    for question in merged.values():
        category = question['categoryCodes'][0]
        folder = LIBRARY / lessons.library_folder(category) / 'Sorular'
        lesson, topic, mikro, match = final_codes(question, decisions.get(question['id']))
        item = {
            'id': question['id'], 'categoryCodes': question['categoryCodes'],
            'lessonMainCode': lesson, 'lessonSubCode': topic, 'lessonMikroCode': mikro, 'match': match,
            'number': question.get('number'), 'question': question['question'], 'options': question['options'],
            'answer': question.get('answer'), 'solution': question.get('solution'),
            'hasFigure': question.get('hasFigure', False), 'figure': question.get('figure'), 'figureImages': question.get('figureImages', []),
            'needsVision': bool(question.get('needsVision') and not question.get('visionRead')),
            'region': question.get('region', []), 'source': question['source'], 'alsoIn': question.get('alsoIn', []),
            'warnings': question.get('warnings', []), 'usedForVideo': question['id'] in used,
        }
        if item['needsVision']:
            target = folder / '_GorselOkumaBekliyor.jsonl'
            stats['görsel okuma bekliyor'] += 1
        elif not lesson:
            target = folder / '_DersBekliyor.jsonl'
            stats['ders bekliyor'] += 1
        elif not topic:
            target = folder / lesson / '_KonuBekliyor.jsonl'
            stats['konu bekliyor'] += 1
        else:
            target = folder / lesson / f'{topic}.jsonl'
            stats['konuya bağlı'] += 1
            if match.get('needsReview'):
                stats['konuya bağlı, inceleme önerilen'] += 1
            if mikro:
                stats['alt konuya kadar'] += 1
        outputs[target].append(item)

    for folder in folders:
        target = LIBRARY / folder / 'Sorular'
        if target.exists():
            shutil.rmtree(target)
    for path, items in outputs.items():
        records.write_jsonl(path, sorted(items, key=lambda i: (i['source'].get('kind', ''), i['source'].get('file', ''), i['number'] or 0, i['id'])))

    explanation_count = build_explanations(exam, used)
    stats['konu anlatımı dosyası'] = explanation_count
    stats['soru (tekil)'] = len(merged)
    report('  ' + ', '.join(f'{k}: {v}' for k, v in stats.items()))
    write_index(report)
    return dict(stats)


def build_explanations(exam: str, used: set[str]) -> int:
    folders = EXAM_FOLDERS[exam]
    for folder in folders:
        target = LIBRARY / folder / 'KonuAnlatimi'
        if target.exists():
            shutil.rmtree(target)
    topics: dict[tuple[str, str, str], dict] = {}
    for path in sorted((STAGE / 'explanations').glob('*.json')):
        data = json.loads(path.read_text(encoding='utf-8'))
        category = data['categoryCodes'][0]
        if not lessons.library_folder(category).startswith(tuple(folders)):
            continue
        key = (lessons.library_folder(category), data['lessonCode'], data['topicCode'])
        lesson = lessons.lesson(category, data['lessonCode'])
        topic = lesson.topics[data['topicCode']]
        entry = topics.setdefault(key, {
            'id': f"{category}-{data['lessonCode']}-{data['topicCode']}", 'categoryCodes': data['categoryCodes'],
            'lessonMainCode': data['lessonCode'], 'lessonMainName': lesson.name,
            'lessonSubCode': topic.code, 'lessonSubName': topic.name,
            'lessonMikros': [{'code': m.code, 'name': m.name} for m in topic.mikros.values()],
            'explanations': [], 'knowledgePacks': [], 'usedForVideo': False,
        })
        entry['explanations'].append({'source': data['source'], 'title': data.get('title'), 'sections': data['sections']})
        for pack in data.get('groundTruth', []):
            pack_path = SOURCES / pack
            if pack_path.exists() and pack not in [p['file'] for p in entry['knowledgePacks']]:
                entry['knowledgePacks'].append({'file': pack, 'pack': json.loads(pack_path.read_text(encoding='utf-8'))})
    for (folder, lesson, topic), entry in topics.items():
        entry['usedForVideo'] = entry['id'] in used
        path = LIBRARY / folder / 'KonuAnlatimi' / lesson / f'{topic}.json'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(entry, ensure_ascii=False, indent=1), encoding='utf-8')
    return len(topics)


# ---------------------------------------------------------------- index and report

def write_index(report=print) -> None:
    index = {'categories': []}
    lines = ['# Kütüphane durumu', '', 'Konu başına: konu anlatımı var mı, kaç soru bağlı (kaynak türüne göre), kaçı inceleme bekliyor.', '']
    seen_folders = set()
    for code, category in lessons.catalog().items():
        folder = lessons.library_folder(code)
        if not (LIBRARY / folder).exists() or folder in seen_folders:
            continue
        seen_folders.add(folder)
        entry = {'code': code, 'folder': folder, 'lessons': []}
        lines += [f'## {folder} ({category.name})', '', '| Ders | Konu | Anlatım | Soru | ÖSYM | Kitap | Sınavika | İnceleme |', '|---|---|---|---|---|---|---|---|']
        for lesson in category.lessons.values():
            lesson_entry = {'code': lesson.code, 'name': lesson.name, 'topics': [], 'pending': 0}
            pending = LIBRARY / folder / 'Sorular' / lesson.code / '_KonuBekliyor.jsonl'
            lesson_entry['pending'] = sum(1 for _ in records.read_jsonl(pending))
            for topic in lesson.topics.values():
                questions = list(records.read_jsonl(LIBRARY / folder / 'Sorular' / lesson.code / f'{topic.code}.jsonl'))
                explanation = (LIBRARY / folder / 'KonuAnlatimi' / lesson.code / f'{topic.code}.json').exists()
                kinds = Counter('osym' if q['source'].get('publisher') == 'ÖSYM' else q['source'].get('kind') for q in questions)
                review = sum(1 for q in questions if q['match'].get('needsReview'))
                lesson_entry['topics'].append({'code': topic.code, 'name': topic.name, 'explanation': explanation, 'questions': len(questions),
                                               'bySource': dict(kinds), 'needsReview': review})
                lines.append(f"| {lesson.code} | {topic.name} | {'✓' if explanation else '—'} | {len(questions)} | {kinds.get('osym', 0)} | {kinds.get('pdf', 0)} | {kinds.get('sinavika-bank', 0)} | {review} |")
            if lesson_entry['pending']:
                lines.append(f"| {lesson.code} | _konusu belirlenmeyi bekleyen_ | | {lesson_entry['pending']} | | | | |")
            entry['lessons'].append(lesson_entry)
        for name in ('_DersBekliyor', '_GorselOkumaBekliyor'):
            count = sum(1 for _ in records.read_jsonl(LIBRARY / folder / 'Sorular' / f'{name}.jsonl'))
            entry[name.strip('_')] = count
            lines.append(f"| — | _{name.strip('_')}_ | | {count} | | | | |")
        lines.append('')
        index['categories'].append(entry)
    (LIBRARY / 'Index.json').write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding='utf-8')
    (LIBRARY / 'Rapor.md').write_text('\n'.join(lines), encoding='utf-8')
    report(f"  Index.json ve Rapor.md yazıldı ({len(index['categories'])} klasör)")


def report(exam: str) -> None:
    write_index()
    print((LIBRARY / 'Rapor.md').read_text(encoding='utf-8')[:4000])
