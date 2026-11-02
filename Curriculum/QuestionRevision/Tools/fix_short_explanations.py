"""Üretici dosyadaki kısa (15 karakterden kısa) çeldirici açıklamalarını yaygın kalıplara göre uzatır.
Kullanım: python fix_short_explanations.py <gen.py> ["eski=yeni" ...]"""
import re
import sys

p = sys.argv[1]
s = open(p, encoding='utf-8').read()
n0 = s
# Roma rakamlı kısa ifadeler
s = re.sub(r'"(I|II|III|IV|V) (de|da) doğrudur\."', lambda m: f'"{m.group(1)}. ifade {m.group(2)} doğrudur."', s)
s = re.sub(r'"(I|II|III|IV|V) yanlıştır\."', lambda m: f'"{m.group(1)}. ifade yanlıştır."', s)
s = re.sub(r'"(I|II|III|IV|V) doğrudur\."', lambda m: f'"{m.group(1)}. ifade doğrudur."', s)
# Elle verilen eşleşmeler
for arg in sys.argv[2:]:
    a, b = arg.split('=', 1)
    a, b = f'"{a}"', f'"{b}"'
    assert a in s, a
    s = s.replace(a, b)
open(p, 'w', encoding='utf-8').write(s)
print('değişti' if s != n0 else 'değişmedi')
