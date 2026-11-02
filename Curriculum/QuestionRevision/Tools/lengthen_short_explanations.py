"""Üretici dosyayı yazmadan çalıştırır; 15 karakterden kısa çeldirici açıklamalarını
"…; bu nedenle doğru değildir." biçiminde uzatır. Kullanım: python lengthen_short_explanations.py <gen.py>"""
import ast
import os
import subprocess
import sys

p = os.path.abspath(sys.argv[1])
d = os.path.dirname(p)
code = (f"import sys; sys.path.insert(0, {os.path.dirname(os.path.abspath(__file__))!r}); import generator_core; generator_core.run=lambda *a,**k: None\n"
        f"exec(open({os.path.basename(p)!r},encoding='utf-8').read())\n")
out = subprocess.run([sys.executable, '-c', code], cwd=d, capture_output=True, text=True, encoding='utf-8').stdout
kisa = set()
for line in out.splitlines():
    if line.startswith('KISA '):
        kisa.add(ast.literal_eval(line.split(' ', 2)[2]))
s = open(p, encoding='utf-8').read()
for k in sorted(kisa):
    yeni = (k[:-1] if k.endswith('.') else k) + '; bu nedenle doğru değildir.'
    s = s.replace('"' + k + '"', '"' + yeni + '"')
open(p, 'w', encoding='utf-8').write(s)
print('uzatılan', len(kisa))
