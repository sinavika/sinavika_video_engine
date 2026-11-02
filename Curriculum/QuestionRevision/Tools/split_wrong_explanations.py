"""Aynı soruda birden çok yanlış seçeneğe yazılmış özdeş açıklamaları seçeneği anarak ayırır.
Örnek: "II. ifade yanlıştır." → "“I ve II” seçeneğinde II. ifade yanlıştır."
Kullanım: python split_wrong_explanations.py <revizyon/.../DERS klasörü>   (dosyaları yerinde günceller)"""
import glob
import json
import os
import sys

LOW = {'I': 'ı', 'İ': 'i'}


def kucult(t):
    w = t.split(' ', 1)[0]
    # Roma rakamı, sayı ya da simgeyle başlıyorsa olduğu gibi bırak.
    if len(w) >= 2 and w[0].isupper() and w[1].islower():
        return LOW.get(t[0], t[0].lower()) + t[1:]
    return t


toplam = 0
for f in sorted(glob.glob(os.path.join(sys.argv[1], '*.jsonl'))):
    satirlar, degisti = [], False
    for line in open(f, encoding='utf-8'):
        if not line.strip():
            continue
        r = json.loads(line)
        y = r['cozum']['yanlis']
        opts = {chr(97 + i): o for i, o in enumerate(r['options'])}
        degerler = [v for v in y.values() if v != '—']
        for k, v in y.items():
            if v != '—' and degerler.count(v) > 1:
                y[k] = f"“{opts[k]}” seçeneğinde {kucult(v)}"
                degisti = True
                toplam += 1
        satirlar.append(json.dumps(r, ensure_ascii=False))
    if degisti:
        open(f, 'w', encoding='utf-8').write('\n'.join(satirlar) + '\n')
print('ayrılan açıklama', toplam)
