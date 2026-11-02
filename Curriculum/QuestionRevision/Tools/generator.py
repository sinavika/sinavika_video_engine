import re
import subprocess
import sys
from collections import defaultdict

from generator_core import q, run, T, kay  # noqa: F401

ARAC = __import__('os').path.dirname(__import__('os').path.abspath(__file__))

# Derece işaretinden sonraki ekler "derece" okunuşuna göre yazılır (90°'dir, 90°'den, 90°'lik).
_NORM = [
    (re.compile(r"°'[td][ıiuü]r\b"), "°'dir"),
    (re.compile(r"°'[td][ae]n\b"), "°'den"),
    (re.compile(r"°'[td][ae]\b"), "°'de"),
    (re.compile(r"°'l[ıiuü]k"), "°'lik"),
    (re.compile(r"°'n?[ıiuü]n\b"), "°'nin"),
    (re.compile(r"°'y?[ıiuü]\b"), "°'yi"),
    (re.compile(r"°'y?[ae]\b"), "°'ye"),
]


def norm(s):
    if not isinstance(s, str):
        return [norm(x) for x in s] if isinstance(s, list) else s
    for rx, rep in _NORM:
        s = rx.sub(rep, s)
    return s


def kaynaklar(path, konu):
    """kaynak_goster çıktısından {mikro_no: [ham kaynak kimliği]} ve tüm kaynakların listesini döndürür."""
    out = subprocess.run([sys.executable, 'show_sources.py', path, konu, '900'], capture_output=True,
                         text=True, encoding='utf-8', cwd=ARAC,
                         env={**__import__('os').environ, 'PYTHONIOENCODING': 'utf-8'}).stdout
    ks, al = defaultdict(list), []
    for line in out.splitlines():
        m = re.match(r'\[(.*?)\] (\S+)', line)
        if not m:
            continue
        k, mk = m.group(1), m.group(2)
        al.append(k)
        mm = re.search(r'_(\d+)$', mk)
        if mm and mk.startswith(konu):
            ks[int(mm.group(1))].append(k)
    assert al, (path, konu)
    return dict(ks), al


def make(KS, ALL):
    """Mikroya özgü kaynak listesi yoksa konunun bütün kaynaklarından sırayla verir."""
    cnt = {}

    def Q(s, m, so, st, o, c, ki, g, y, ob, ya, fig=None):
        for yy in y:
            if yy != '—' and len(yy) < 15:
                print('KISA', s, repr(yy))
        lst = KS.get(m) or ALL
        i = cnt.get(m, 0)
        cnt[m] = i + 1
        q(s, m, lst[i % len(lst)], norm(so), norm(st), norm(o), c, norm(ki), norm(g), norm(y), norm(ob), norm(ya), fig=fig)
    return Q


def auto(path, konu):
    """Kaynakları kendisi çeker; ham kimlikler olduğu gibi kullanılır."""
    ks, al = kaynaklar(path, konu)
    return make(ks, al), (lambda s: s)


def R(x):
    return f"Konu içinde aynı kurguyu tekrar eden sorulardan biriydi; {x} soruldu."


def W(why, x):
    return f"İşaretli cevap yanlıştı ({why}); {x} soruldu."


def UL(w, x, kind="sözcüğü"):
    return f"Kökte “{w}” {kind} altı çizili verilmiş ama “altı çizili” denmemişti; çizgi kaldırıldı ve soru yeniden kuruldu. Yeni soruda {x} soruldu."


R5 = ["Yalnız I", "Yalnız II", "Yalnız III", "I ve II", "I ve III"]
