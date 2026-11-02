"""Kullanım: python show_topic.py <sinav_dir> <ders> <konu> [stem_len] [opt_len]
Konunun mikrolarını, orijinal quiz sorularını (kısaltılmış) ve mikro bazında kaynak kimliklerini yazar."""
import json, sys, re, collections, subprocess, os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from paths import DATA
sd, ders, konu = sys.argv[1], sys.argv[2], sys.argv[3]
SL = int(sys.argv[4]) if len(sys.argv) > 4 else 230
OL = int(sys.argv[5]) if len(sys.argv) > 5 else 60
here = os.path.dirname(os.path.abspath(__file__))
print(subprocess.run([sys.executable, os.path.join(here, 'list_micro_topics.py'), sd, ders, konu], capture_output=True, text=True, encoding='utf-8').stdout)
rows = [json.loads(l) for l in open(f'{DATA}/quiz/YKS/{sd}/{ders}.jsonl', encoding='utf-8')]
rows = sorted([r for r in rows if r['hierarchy'].get('lessonSubCode') == konu], key=lambda r: r['id'])
print(len(rows))
for i, r in enumerate(rows, 1):
    opts = ' | '.join(f"{o['key']}){o['text'][:OL]}" for o in r['options'])
    figs = r.get('figures') or []
    fk = ','.join(f"{f.get('Code')}:{f.get('Kind')}" for f in figs)
    u = '<u>' in json.dumps(r, ensure_ascii=False)
    print(f"{i:02d} {r['id'][:8]} [{r['correctKey']}] n={len(r['options'])}{' F=' + fk if figs else ''}{' U' if u else ''} {r['stem'][:SL]!r}\n   {opts}")
out = subprocess.run([sys.executable, os.path.join(here, 'show_sources.py'), f'YKS/{sd}/{ders}', konu, '900'],
                     capture_output=True, text=True, encoding='utf-8', cwd=here).stdout
d = collections.defaultdict(list)
for l in out.splitlines():
    m = re.match(r'\[(.*?)\] (\S+)', l)
    if m:
        k = m.group(1)
        for a, b in (('3adim-soru-bankasi-', '3a-'), ('dortdortluk-', 'dd-'), ('ogm-yks-kamp-testleri-', 'ogm-'), ('tarama-testleri-', 'tr-')):
            k = re.sub(r'^[a-z\-]+?-sr-[a-z\-]+?-' + re.escape(a), b, k)
        d[m.group(2)].append(k)
for k in sorted(d):
    print(k, len(d[k]), ' '.join(d[k][:12]))
