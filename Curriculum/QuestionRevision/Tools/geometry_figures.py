"""Soru figürleri için geometri kurma yardımcıları: motorun `geometry` görselini (src/Components/Visuals/Mathematics/
MathematicsSchema.ts) sorunun verisinden ölçekli kurar.

    from geometry_figures import Fig, tri_sss, on_segment, foot
    B, C, A = (0, 0), (14, 0), None
    A = tri_sss(a=14, b=15, c=13)[0]           # BC=14, CA=15, AB=13
    f = Fig()
    f.point("A", A); f.point("B", (0, 0)); f.point("C", (14, 0))
    f.point("H", foot(A, (0, 0), (14, 0)))
    f.poly("A", "B", "C")
    f.seg("B", "C", "14"); f.seg("A", "H", dashed=True); f.right("H", "A", "C")
    visual = f.visual()

Kurallar (API ölçekli şekil kuralı, ContentFigure GeometryFigure.MeasureMismatch):
- Sayı etiketi ("6", "2,5", "6 cm", "40°") çizimle tutmalı: uzunluk %5, açı 2°, dik açı 90°. `visual()` tutmayanı reddeder.
- Harfli etiket ("x", "2a", "?") ölçü sayılmaz; "4√3" gibi kök etiketi de denetlenir.
- y yukarı doğru büyür. Nokta adı en çok 4 karakter, etiket en çok 12; en çok 24 nokta, 24 parça, 12 açı, 6 çember.
"""
import math
import re

MEASURE = re.compile(r"^\s*(\d+(?:[.,]\d+)?)\s*(?:cm|mm|m|km|br|birim)?\s*$")
ROOT = re.compile(r"^\s*(\d+(?:[.,]\d+)?)?\s*√\s*(\d+(?:[.,]\d+)?)\s*(?:cm|mm|m|km|br|birim)?\s*$")
DEGREE = re.compile(r"^\s*(\d+(?:[.,]\d+)?)\s*°\s*$")


# --- noktalar ---------------------------------------------------------------------------------------------------------

def dist(p, q):
    return math.hypot(q[0] - p[0], q[1] - p[1])


def mid(p, q):
    return ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2)


def on_segment(p, q, t):
    """p'den q'ya t oranında nokta (t = |PX| / |PQ|)."""
    return (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)


def split(p, q, m, n):
    """[PQ]'yu |PX| : |XQ| = m : n bölen X."""
    return on_segment(p, q, m / (m + n))


def toward(p, q, length):
    """p'den q yönünde `length` uzaklıktaki nokta."""
    d = dist(p, q)
    return (p[0] + (q[0] - p[0]) * length / d, p[1] + (q[1] - p[1]) * length / d)


def polar(p, length, degrees):
    """p'den `degrees` yönünde (0 = sağ, saat yönünün tersi) `length` uzaklıktaki nokta."""
    a = math.radians(degrees)
    return (p[0] + length * math.cos(a), p[1] + length * math.sin(a))


def rotate(p, center, degrees):
    a = math.radians(degrees)
    x, y = p[0] - center[0], p[1] - center[1]
    return (center[0] + x * math.cos(a) - y * math.sin(a), center[1] + x * math.sin(a) + y * math.cos(a))


def reflect(p, a, b):
    """p'nin AB doğrusuna göre yansıması."""
    f = foot(p, a, b)
    return (2 * f[0] - p[0], 2 * f[1] - p[1])


def foot(p, a, b):
    """p'den AB doğrusuna inen dikmenin ayağı."""
    ax, ay = b[0] - a[0], b[1] - a[1]
    t = ((p[0] - a[0]) * ax + (p[1] - a[1]) * ay) / (ax * ax + ay * ay)
    return (a[0] + ax * t, a[1] + ay * t)


def intersect(p1, p2, q1, q2):
    """P1P2 ve Q1Q2 doğrularının kesişimi."""
    d = (p1[0] - p2[0]) * (q1[1] - q2[1]) - (p1[1] - p2[1]) * (q1[0] - q2[0])
    if abs(d) < 1e-12:
        raise ValueError("doğrular paralel")
    a = p1[0] * p2[1] - p1[1] * p2[0]
    b = q1[0] * q2[1] - q1[1] * q2[0]
    return ((a * (q1[0] - q2[0]) - (p1[0] - p2[0]) * b) / d, (a * (q1[1] - q2[1]) - (p1[1] - p2[1]) * b) / d)


def angle_at(v, p, q):
    """V köşesinde PVQ açısı (derece, 0–180)."""
    a = math.atan2(p[1] - v[1], p[0] - v[0]) - math.atan2(q[1] - v[1], q[0] - v[0])
    d = abs(math.degrees(a)) % 360
    return 360 - d if d > 180 else d


# --- üçgenler (B = (0, 0), C = (a, 0), A üstte) ------------------------------------------------------------------------

def tri_sss(a, b, c):
    """Üç kenardan: a = |BC|, b = |CA|, c = |AB|. Dönüş (A, B, C)."""
    x = (c * c + a * a - b * b) / (2 * a)
    y2 = c * c - x * x
    if y2 <= 0:
        raise ValueError("üçgen eşitsizliği tutmuyor")
    return (x, math.sqrt(y2)), (0.0, 0.0), (float(a), 0.0)


def tri_angles(b_deg, c_deg, a=10):
    """Taban |BC| = a ve taban açıları B, C'den. Dönüş (A, B, C)."""
    B, C = (0.0, 0.0), (float(a), 0.0)
    return intersect(B, polar(B, 1, b_deg), C, polar(C, 1, 180 - c_deg)), B, C


def tri_sas(c, b_deg, a):
    """|AB| = c, B açısı, |BC| = a. Dönüş (A, B, C)."""
    return polar((0.0, 0.0), c, b_deg), (0.0, 0.0), (float(a), 0.0)


def bisector_foot(a, b, c):
    """A açısının açıortayının [BC] üzerindeki ayağı (|BD| : |DC| = |AB| : |AC|)."""
    return split(b, c, dist(a, b), dist(a, c))


def centroid(a, b, c):
    return ((a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3)


def incenter(a, b, c):
    la, lb, lc = dist(b, c), dist(c, a), dist(a, b)
    s = la + lb + lc
    return ((la * a[0] + lb * b[0] + lc * c[0]) / s, (la * a[1] + lb * b[1] + lc * c[1]) / s)


def circumcenter(a, b, c):
    return intersect(mid(a, b), rotate(b, mid(a, b), 90), mid(a, c), rotate(c, mid(a, c), 90))


def orthocenter(a, b, c):
    return intersect(a, foot(a, b, c), b, foot(b, a, c))


# --- figür ------------------------------------------------------------------------------------------------------------

def _label_value(label):
    if label is None:
        return None
    m = MEASURE.match(label)
    if m:
        return float(m.group(1).replace(",", "."))
    m = ROOT.match(label)
    if m:
        k = float((m.group(1) or "1").replace(",", "."))
        return k * math.sqrt(float(m.group(2).replace(",", ".")))
    return None


def _r(v):
    return round(v, 4) + 0.0


class Fig:
    """Motorun `geometry` görselini kurar. Adlar soru metnindeki nokta adlarıdır."""

    def __init__(self):
        self.points, self.segments, self.polygons, self.circles, self.angles = {}, [], [], [], []
        self._labels, self._hidden, self._extra = {}, set(), {}

    def point(self, pid, at, label=None, hidden=False, dot=True):
        """`label` verilmezse adı yazılır; "" yalnız nokta, hidden yalnız yardımcı."""
        if pid in self.points:
            raise ValueError(f"{pid} iki kez tanımlandı")
        self.points[pid] = (float(at[0]), float(at[1]))
        if label is not None:
            self._labels[pid] = label
        if hidden:
            self._hidden.add(pid)
        if not dot:
            self._extra[pid] = {"dot": False}
        return self.points[pid]

    def seg(self, a, b, label=None, dashed=False, ticks=0):
        s = {"from": a, "to": b}
        if label is not None:
            s["label"] = label
        if dashed:
            s["dashed"] = True
        if ticks:
            s["ticks"] = ticks
        self.segments.append(s)

    def poly(self, *pids, fill=True, label=None, shade=1):
        p = {"points": list(pids)}
        if not fill:
            p["fill"] = False
        if label:
            p["label"] = label
        if shade != 1:
            p["shade"] = shade
        self.polygons.append(p)

    def circle(self, center, radius, label=None, arc=None, dashed=False, fill=False):
        c = {"center": center, "radius": _r(radius)}
        if label:
            c["label"] = label
        if arc:
            c["arc"] = [_r(arc[0]), _r(arc[1])]
        if dashed:
            c["dashed"] = True
        if fill:
            c["fill"] = True
        self.circles.append(c)

    def angle(self, at, frm, to, label=None, arcs=1):
        """`at` köşesinde `frm`–`to` arasındaki açı (iç açı, 180°'den küçük)."""
        a = {"at": at, "from": frm, "to": to}
        if label:
            a["label"] = label
        if arcs != 1:
            a["arcs"] = arcs
        self.angles.append(a)

    def right(self, at, frm, to):
        self.angles.append({"at": at, "from": frm, "to": to, "right": True})

    def check(self):
        """Ölçekli şekil kuralı: sayı etiketleri çizimle tutmalı (API ile aynı sınırlar)."""
        P = self.points
        for s in self.segments:
            v = _label_value(s.get("label"))
            if v is not None:
                d = dist(P[s["from"]], P[s["to"]])
                if abs(d - v) > v * 0.05:
                    raise ValueError(f"|{s['from']}{s['to']}| etiketi {s['label']} ama çizimde {d:.2f}")
        for a in self.angles:
            want = 90.0 if a.get("right") else None
            if not want and a.get("label"):
                m = DEGREE.match(a["label"])
                want = float(m.group(1).replace(",", ".")) if m else None
            if want is not None:
                got = angle_at(P[a["at"]], P[a["from"]], P[a["to"]])
                if abs(got - want) > 2:
                    raise ValueError(f"{a['from']}{a['at']}{a['to']} açısı {want}° olmalı, çizimde {got:.1f}°")
        for c in self.circles:
            if c["center"] not in P:
                raise ValueError(f"çember merkezi {c['center']} nokta değil")
        for item in self.segments + self.angles:
            for k in ("from", "to", "at"):
                if k in item and item[k] not in P:
                    raise ValueError(f"{item[k]} nokta değil")
        if len(P) > 24 or len(self.segments) > 24 or len(self.angles) > 12 or len(self.circles) > 6 or len(self.polygons) > 12:
            raise ValueError("motorun sınırı aşıldı (24 nokta, 24 parça, 12 açı, 6 çember, 12 çokgen)")

    def visual(self, pad=0.14, axes=None):
        """Motorun görseli. Görünüm kutusu noktaları ve çemberleri pay bırakarak sarar. Motor çokgeni yalnız dolgu olarak
        çizer; çizgisi olmayan kenarlar burada parça olarak eklenir (ÖSYM şeklinde her kenar çizilir)."""
        var = {frozenset((s["from"], s["to"])) for s in self.segments}
        for poly in self.polygons:
            pts = poly["points"]
            for i in range(len(pts)):
                kenar = frozenset((pts[i], pts[(i + 1) % len(pts)]))
                if kenar not in var:
                    self.segments.append({"from": pts[i], "to": pts[(i + 1) % len(pts)]})
                    var.add(kenar)
        self.check()
        xs = [p[0] for p in self.points.values()]
        ys = [p[1] for p in self.points.values()]
        for c in self.circles:
            x, y = self.points[c["center"]]
            xs += [x - c["radius"], x + c["radius"]]
            ys += [y - c["radius"], y + c["radius"]]
        w, h = max(xs) - min(xs) or 1, max(ys) - min(ys) or 1
        side = max(w, h)
        px, py = pad * side, pad * side
        view = [_r(min(xs) - px), _r(min(ys) - py), _r(max(xs) + px), _r(max(ys) + py)]
        points = []
        for pid, (x, y) in self.points.items():
            p = {"id": pid, "at": [_r(x), _r(y)]}
            if pid in self._labels:
                p["label"] = self._labels[pid]
            if pid in self._hidden:
                p["hidden"] = True
            p.update(self._extra.get(pid, {}))
            points.append(p)
        v = {"kind": "geometry", "view": view, "points": points}
        if axes:
            v["axes"] = axes
        for key, items in (("segments", self.segments), ("polygons", self.polygons), ("circles", self.circles), ("angles", self.angles)):
            if items:
                v[key] = items
        return v
