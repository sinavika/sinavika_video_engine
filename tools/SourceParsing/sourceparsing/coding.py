"""
Coding staged questions to the lesson list: lesson (LessonMain), topic (LessonSub), subtopic (LessonMikro).

1. Rules: what the source itself says decides when it is certain — Sinavika bank codes that exist in the list,
   the topic of a MEB chapter for its own test, ÖSYM booklet positions for the lesson.
2. Claude, in message batches: the question with its options and the source's hints, and the lesson tree
   (only the hinted lesson's branch when the lesson is known). Answers are checked against the list.
3. A second, more careful model looks again where the first was unsure or disagreed with a strong hint.
   Where the two still differ the question is kept with needsReview and both suggestions.

Decisions are kept in STAGE/coding/<exam>.jsonl (one line per question id, the last line wins), so the
library can be rebuilt without asking again, and a re-run only asks for what is still undecided.
"""
from __future__ import annotations

import json
import re
import time
from pathlib import Path

from . import claude_api, lessons, records
from .paths import STAGE

ACCEPT = 0.8          # model confidence needed without a second look
RULE_CERTAIN = 0.95   # hint confidence that decides on its own (with valid codes)
BATCH_SIZE = 5000


def decisions_file(exam: str) -> Path:
    return STAGE / 'coding' / f'{exam.lower()}.jsonl'


def load_decisions(exam: str) -> dict[str, dict]:
    decided: dict[str, dict] = {}
    for record in records.read_jsonl(decisions_file(exam)):
        decided[record['id']] = record
    return decided


def append_decisions(exam: str, items: list[dict]) -> None:
    path = decisions_file(exam)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('a', encoding='utf-8') as handle:
        for item in items:
            handle.write(json.dumps(item, ensure_ascii=False) + '\n')


PREFIXES = {'kpss': ('kpss-', 'bank-kpss_'), 'yks': ('yks-', 'bank-yks_'), 'abd': ('abd-',)}


def staged_questions(exam: str):
    """Staged questions of an exam, with what was read from their page images laid over the text-layer version."""
    from .vision import region_overlay
    overlay = region_overlay(exam)
    for path in sorted((STAGE / 'questions').glob('*.jsonl')):
        if not path.stem.startswith(PREFIXES[exam.lower()]):
            continue
        for question in records.read_jsonl(path):
            read = overlay.get(question['id'])
            if read:
                question = {**question, 'question': read['question'], 'options': read['options'], 'figure': read.get('figure'),
                            'figureImages': read.get('figureImages', []), 'needsVision': False, 'visionRead': True,
                            'hasFigure': question.get('hasFigure') or bool(read.get('figure'))}
                if not read.get('legible', True):
                    question['warnings'] = question.get('warnings', []) + ['görüntü okunaksız']
            yield question


# ---------------------------------------------------------------- rules

def rule_decision(question: dict) -> dict | None:
    """A decision from the source alone, or None when a model has to read the question."""
    hint = question.get('hint') or {}
    category = question['categoryCodes'][0]
    lesson, topic, mikro = lessons.validate(category, hint.get('lessonCode'), hint.get('topicCode'), hint.get('mikroCode'))
    if hint.get('confidence', 0) >= RULE_CERTAIN and lesson and topic and mikro and not hint.get('lessonCandidates'):
        return {'id': question['id'], 'lesson': lesson, 'topic': topic, 'mikro': mikro, 'confidence': hint['confidence'],
                'method': hint.get('method', 'rule'), 'needsReview': False}
    return None


# ---------------------------------------------------------------- prompts

SYSTEM = """Sen Türkiye'deki merkezi sınavların (KPSS, YKS) müfredatını çok iyi bilen bir ölçme-değerlendirme uzmanısın.
Görevin: verilen çoktan seçmeli soruyu aşağıdaki ders listesinde ölçtüğü TEK konuya (## satırları) ve o konunun TEK alt konusuna (- satırları) bağlamak.

Kurallar:
- Sadece listede yazan kodları kullan; kod uydurma, değiştirme.
- Sorunun asıl ölçtüğü bilgiye/beceriye bak; metindeki geçici bağlam (ör. bir tarih paragrafındaki dil bilgisi sorusu) konuyu belirlemez.
- Soru birden çok konuya dokunuyorsa, doğru cevabı bulmak için gereken ana bilgiyi seç.
- Kaynak ipuçları (kitapçık adı, eski konu adı, soru sırası) yol gösterir ama soru içeriğiyle çelişiyorsa içeriğe uy.
- confidence: 0 ile 1 arasında, bu eşleştirmenin doğru olduğuna ne kadar eminsen. Emin değilsen düşük ver; tahmini yüksek gösterme.
- Yanıt yalnızca tek bir JSON nesnesi olsun: {"lesson": "...", "topic": "...", "mikro": "...", "confidence": 0.0, "reason": "en fazla 15 kelime"}

Ders listesi ({category}):
{outline}"""


def _question_text(question: dict) -> str:
    lines = [f"Soru: {question['question']}"]
    for option in question['options']:
        lines.append(f"{option['key']}) {option['text']}")
    if question.get('answer'):
        lines.append(f"Doğru cevap: {question['answer']}")
    hint = question.get('hint') or {}
    clues = []
    if question['source'].get('title'):
        clues.append(f"kaynak: {question['source']['title']}")
    if question['source'].get('test'):
        clues.append(f"bölüm: {question['source']['test']}")
    if hint.get('oldNames'):
        clues.append('eski konu adı: ' + ' / '.join(n for n in hint['oldNames'] if n and n != 'NULL'))
    if hint.get('topicCode'):
        clues.append(f"kaynağın konusu: {hint['topicCode']}")
    if hint.get('booklet'):
        clues.append(f"kitapçık: {hint['booklet']}")
    if clues:
        lines.append('İpuçları: ' + '; '.join(clues))
    return '\n'.join(lines)


def _scope(question: dict) -> list[str] | None:
    """The lessons whose branch is shown: the hinted lesson (and its candidates), or the whole category."""
    hint = question.get('hint') or {}
    category = question['categoryCodes'][0]
    candidates = hint.get('lessonCandidates') or ([hint['lessonCode']] if hint.get('lessonCode') and hint.get('confidence', 0) >= 0.85 else None)
    if candidates:
        valid = [c for c in candidates if lessons.lesson(category, c)]
        return valid or None
    return None


def request_for(question: dict, model: str) -> dict:
    category = question['categoryCodes'][0]
    scope = _scope(question)
    system = SYSTEM.replace('{category}', category).replace('{outline}', lessons.outline(category, scope))
    return {
        'custom_id': re.sub(r'[^a-zA-Z0-9_-]', '_', question['id'])[:64],
        'params': {
            'model': model,
            'max_tokens': 200,
            'system': [{'type': 'text', 'text': system, 'cache_control': {'type': 'ephemeral'}}],
            'messages': [{'role': 'user', 'content': _question_text(question)}],
        },
    }


def parse_answer(question: dict, text: str, model: str) -> dict:
    category = question['categoryCodes'][0]
    match = re.search(r'\{.*\}', text, re.S)
    try:
        data = json.loads(match.group(0)) if match else {}
    except json.JSONDecodeError:
        data = {}
    lesson, topic, mikro = lessons.validate(category, data.get('lesson'), data.get('topic'), data.get('mikro'))
    confidence = float(data.get('confidence') or 0)
    if not (lesson and topic):
        confidence = 0.0
    return {'id': question['id'], 'lesson': lesson, 'topic': topic, 'mikro': mikro, 'confidence': round(confidence, 3),
            'reason': (data.get('reason') or '')[:200], 'model': model}


def agrees_with_hint(question: dict, decision: dict) -> bool:
    hint = question.get('hint') or {}
    if hint.get('confidence', 0) >= 0.9 and hint.get('lessonCode') and not hint.get('lessonCandidates') and decision['lesson'] != hint['lessonCode']:
        return False
    if hint.get('confidence', 0) >= 0.9 and hint.get('topicCode') and decision['topic'] != hint['topicCode']:
        return False
    return True


# ---------------------------------------------------------------- batches

def _run_batch(exam: str, questions: list[dict], model: str, report=print) -> list[dict]:
    by_id = {re.sub(r'[^a-zA-Z0-9_-]', '_', q['id'])[:64]: q for q in questions}
    results = []
    for start in range(0, len(questions), BATCH_SIZE):
        chunk = questions[start:start + BATCH_SIZE]
        batch_id = claude_api.submit_batch([request_for(q, model) for q in chunk])
        log = STAGE / 'coding' / f'{exam.lower()}-batches.jsonl'
        log.parent.mkdir(parents=True, exist_ok=True)
        with log.open('a', encoding='utf-8') as handle:
            handle.write(json.dumps({'batch': batch_id, 'model': model, 'count': len(chunk), 'at': time.strftime('%Y-%m-%dT%H:%M:%S')}) + '\n')
        report(f'  {model}: {len(chunk)} soru gönderildi ({batch_id})')
        claude_api.wait_batch(batch_id, report=report)
        for item in claude_api.batch_results(batch_id):
            question = by_id.get(item['custom_id'])
            if not question:
                continue
            if item['result']['type'] != 'succeeded':
                results.append({'id': question['id'], 'lesson': None, 'topic': None, 'mikro': None, 'confidence': 0.0,
                                'reason': item['result']['type'], 'model': model})
                continue
            results.append(parse_answer(question, claude_api.text_of(item['result']['message']), model))
    return results


def code(exam: str, mode: str = 'all', report=print) -> None:
    """mode: 'rules' (no API), 'all' (rules, then the fast model, then the careful model where needed)."""
    decided = load_decisions(exam)
    questions = [q for q in staged_questions(exam) if not q.get('needsVision') or q.get('visionRead')]
    pending = [q for q in questions if q['id'] not in decided]

    rule_items = []
    for question in pending:
        decision = rule_decision(question)
        if decision:
            rule_items.append(decision)
    append_decisions(exam, rule_items)
    report(f'  kurallarla kesinleşen: {len(rule_items)}')
    if mode == 'rules':
        return
    if not claude_api.available():
        raise SystemExit('ANTHROPIC_API_KEY yok: .env dosyasına ekleyin (değer hiçbir yere yazdırılmaz).')

    ruled = {item['id'] for item in rule_items}
    ask = [q for q in pending if q['id'] not in ruled]
    report(f'  modele sorulacak: {len(ask)}')
    first = {d['id']: d for d in _run_batch(exam, ask, claude_api.FAST_MODEL, report)}

    accepted, second_look = [], []
    by_id = {q['id']: q for q in ask}
    for qid, decision in first.items():
        question = by_id[qid]
        if decision['confidence'] >= ACCEPT and decision['mikro'] and agrees_with_hint(question, decision):
            accepted.append({**decision, 'method': 'claude', 'needsReview': False})
        else:
            second_look.append(question)
    append_decisions(exam, accepted)
    report(f'  ilk bakışta kabul: {len(accepted)}, ikinci bakış: {len(second_look)}')

    second = {d['id']: d for d in _run_batch(exam, second_look, claude_api.CAREFUL_MODEL, report)} if second_look else {}
    final = []
    for question in second_look:
        a, b = first[question['id']], second.get(question['id'])
        if b and b['lesson'] and b['topic'] and (b['topic'] == a['topic'] or b['confidence'] >= ACCEPT) and agrees_with_hint(question, b):
            same = b['topic'] == a['topic']
            final.append({**b, 'confidence': max(a['confidence'], b['confidence']) if same else b['confidence'],
                          'method': 'claude-2' if same else 'claude-careful', 'needsReview': not same and b['confidence'] < 0.9,
                          'alternatives': [] if same else [{k: a[k] for k in ('lesson', 'topic', 'mikro', 'confidence', 'model')}]})
        else:
            best = b if b and b['confidence'] >= a['confidence'] else a
            final.append({**best, 'method': 'claude-unsure', 'needsReview': True,
                          'alternatives': [{k: x[k] for k in ('lesson', 'topic', 'mikro', 'confidence', 'model')} for x in (a, b) if x and x is not best]})
    append_decisions(exam, final)
    report(f"  ikinci bakış sonucu: {sum(not f['needsReview'] for f in final)} kabul, {sum(f['needsReview'] for f in final)} incelemeye")
