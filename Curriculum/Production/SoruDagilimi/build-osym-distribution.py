"""ÖSYM past-question distribution per exam / lesson / topic / year.

Reads the ÖSYM questions in Desktop/EgitimVerileri (EGITIM_VERILERI overrides; MEB's ÖSYM collections for YKS 2018-2026, ÖSYM KPSS booklets
2009-2022) and the catalog, and writes osym-soru-dagilimi-<exam>.md + osym-soru-dagilimi.json next to this file.

    python -I Curriculum/Production/SoruDagilimi/build-osym-distribution.py
"""
import collections
import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
# The education data is not copied into the engine: it is read where the parsing pipeline writes it (31 Oct 2026).
DATA = os.environ.get('EGITIM_VERILERI') or os.path.join(os.path.expanduser('~'), 'Desktop', 'EgitimVerileri')
EXAMS = {
    'YKS/TYT': ('YKS_TYT', 'yks-tyt'),
    'YKS/AYT': ('YKS_AYT', 'yks-ayt'),
    'YKS/YDT': ('YKS_YDT', 'yks-ydt'),
    'KPSS/Lisans': ('KPSS_LISANS', 'kpss-lisans'),
    'KPSS/OnlisansOrtaogretim': ('KPSS_ONLISANS', 'kpss-onlisans-ortaogretim'),
}


def osym_rows(folder):
    rows = []
    for f in glob.glob(os.path.join(DATA, *folder.split('/'), 'Sorular', '*', '*.jsonl')):
        for line in open(f, encoding='utf-8'):
            r = json.loads(line)
            s = r.get('source') or {}
            if 'SYM' not in (s.get('publisher') or '').upper():
                continue
            year = s.get('year')
            if year is None:
                m = re.search(r'(20\d\d)', s.get('title') or '')
                year = int(m.group(1)) if m else None
            rows.append({'lesson': r.get('lessonMainCode'), 'topic': r.get('lessonSubCode'),
                         'mikro': r.get('lessonMikroCode'), 'year': year, 'test': s.get('test')})
    return rows


summary = {}
for folder, (catalog_code, slug) in EXAMS.items():
    cat = json.load(open(os.path.join(ROOT, 'Curriculum', 'Catalog', catalog_code + '.json'), encoding='utf-8'))
    R = osym_rows(folder)
    years = sorted({r['year'] for r in R if r['year']})
    by_topic = collections.defaultdict(collections.Counter)
    for r in R:
        by_topic[(r['lesson'], r['topic'])][r['year']] += 1
    by_mikro = collections.Counter(r['mikro'] for r in R if r['mikro'])
    lesson_total = collections.Counter(r['lesson'] for r in R)
    headings = collections.defaultdict(collections.Counter)
    for r in R:
        headings[r['lesson']][r['test']] += 1
    undated = sum(1 for r in R if not r['year'])
    out = [f'# {folder}: ÖSYM soruları', '',
           f'{len(R)} soru, yıllar {years[0]}–{years[-1]} ({undated} sorunun yılı yok). '
           'Konu ve alt başlık eşlemesi Claude kodlamasıdır; alt başlık sütunu yön gösterir, kesin değildir. '
           'Üretim: `build-osym-distribution.py`.', '']
    s = {'total': len(R), 'undated': undated, 'years': years, 'lessons': {}}
    for L in cat['lessons']:
        out += [f"## {L['name']} ({L['code']}) · {lesson_total.get(L['code'], 0)} soru", '',
                '| Konu | Toplam | Yıl başına | ' + ' | '.join(str(y)[2:] for y in years) + ' | Hiç soru eşlenmeyen alt başlıklar |',
                '|---|---|---|' + '---|' * len(years) + '---|']
        topics = []
        for T in L['topics']:
            cnt = by_topic.get((L['code'], T['code']), collections.Counter())
            total = sum(cnt.values())
            per_year = sum(v for k, v in cnt.items() if k) / len(years) if years else 0
            unasked = [m['name'] for m in T.get('subtopics', []) if not by_mikro.get(m['code'])]
            out.append(f"| {T['name']} | {total} | {per_year:.1f} | " + ' | '.join(str(cnt.get(y, 0) or '·') for y in years)
                       + ' | ' + '; '.join(unasked) + ' |')
            topics.append({'code': T['code'], 'name': T['name'], 'total': total, 'perYear': round(per_year, 2),
                           'byYear': {str(k): v for k, v in cnt.items()}, 'mikrosUnasked': unasked})
        out += ['', 'Kaynaktaki başlıklar: ' + '; '.join(f'{k} ({v})' for k, v in headings[L['code']].most_common()), '']
        s['lessons'][L['code']] = {'name': L['name'], 'total': lesson_total.get(L['code'], 0), 'topics': topics}
    open(os.path.join(HERE, f'osym-soru-dagilimi-{slug}.md'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    summary[folder] = s
json.dump(summary, open(os.path.join(HERE, 'osym-soru-dagilimi.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('written:', ', '.join(EXAMS))
