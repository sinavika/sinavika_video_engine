"""Bir soru figürünü (API'nin C# figür verisi: Kind + DataJson) motorun görseline (src/Components/Visuals/VisualSchema.ts)
çevirir. Figürleri motor çizer (1 Kasım 2026 kararı); eski figürler ve C# biçiminde yazılmış revizyonlar bununla taşınır.

    from figure_to_visual import to_visual, Unsupported
    visual = to_visual(kind, data)          # data: DataJson'ın sözlüğü

Motorun şemasına sığmayan figür `Unsupported` atar; nedeni motor isteği olarak yazılır, figür sözele çevrilmez.
Sınırlar motorun şemasındakilerle aynıdır; son söz motorundur (`npm run figures -- --list` şemayı denetler).
"""
import math

TABLE, CHART, DIAGRAM, MAP, PLOT, CLIMATE, TIMELINE, PYRAMID, CONTOUR = 1, 2, 3, 5, 6, 10, 11, 30, 43


class Unsupported(Exception):
    """Figür motorun bugünkü şemasına sığmıyor."""


def cell(value):
    """Tablo hücresi metni: tam sayılar olduğu gibi, ondalıklar Türkçe virgülle."""
    if isinstance(value, bool):
        return "Evet" if value else "Hayır"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float):
        return str(int(value)) if value.is_integer() else f"{value:g}".replace(".", ",")
    return str(value).strip()


def nice_ceiling(value):
    """Eksenin üst sınırı: değerin biraz üstündeki yuvarlak sayı (1, 1,2, 1,5, 2, 2,5, 3, 4, 5, 6, 8 × 10ⁿ); çubuklar
    eksenin büyük kısmını kaplar."""
    if value <= 0:
        return 1
    power = 10 ** math.floor(math.log10(value))
    for step in (1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10):
        if value <= step * power:
            top = step * power
            return int(top) if float(top).is_integer() else top
    return 10 * power


def table(data):
    header = [cell(c) for c in data.get("columns") or []]
    rows = [[cell(c) for c in row] for row in data.get("rows") or []]
    width = max([len(header)] + [len(r) for r in rows])
    problems = []
    if not header or not rows:
        problems.append("başlık ya da satır yok")
    if width > 6:
        problems.append(f"{width} sütun (en çok 6)")
    if len(rows) > 8:
        problems.append(f"{len(rows)} satır (en çok 8)")
    if any(len(h) > 30 for h in header):
        problems.append("başlık hücresi 30 karakteri aşıyor: " + max(header, key=len))
    long = [c for r in rows for c in r if len(c) > 40]
    if long:
        problems.append("hücre 40 karakteri aşıyor: " + max(long, key=len))
    if any("$" in c for c in header + [c for r in rows for c in r]):
        problems.append("hücrede $ var (motor formül sanır)")
    if problems:
        raise Unsupported("table: " + "; ".join(problems))
    visual = {"kind": "table", "header": header, "rows": [r + [""] * (len(header) - len(r)) for r in rows]}
    if isinstance(data.get("highlightColumn"), int):
        visual["highlightColumn"] = data["highlightColumn"]
    return visual


def chart(data):
    series = data.get("series") or []
    labels = [cell(x) for x in data.get("labels") or []]
    if len(series) != 1:
        raise Unsupported(f"plot: {len(series)} serili grafik (motorun grafiği tek seri çiziyor)")
    values = series[0]["values"]
    kind = {"bar": "bars", "column": "bars", "line": "line"}.get(data.get("chartType"))
    if kind is None:
        raise Unsupported(f"plot: {data.get('chartType')} grafiği")
    if any(len(x) > 12 for x in labels):
        raise Unsupported("plot: etiket 12 karakteri aşıyor")
    low = min(0, min(values))
    y = [low if low == 0 else -nice_ceiling(-low), nice_ceiling(max(values) * 1.1)]
    if kind == "line" and min(values) > 0 and max(values) - min(values) < 0.3 * max(values):
        # Dar aralıktaki çizgi (ör. 1008–1019 hPa) sıfırdan başlarsa düz görünür; çubuk ise her zaman sıfırdan başlar.
        step = nice_ceiling((max(values) - min(values)) / 4)
        y = [math.floor(min(values) / step - 1) * step, math.ceil(max(values) / step + 1) * step]
    visual = {"kind": "plot", "x": [0, len(values) + 1], "y": y,
              "series": {"kind": kind, "values": [{"x": i + 1, "y": v, "label": labels[i]} for i, v in enumerate(values)]}}
    if series[0].get("name"):
        visual["yLabel"] = series[0]["name"]
    return visual


def plot(data):
    series = data.get("series") or []
    if len(series) != 1 or series[0].get("kind") != "line" or data.get("annotations"):
        raise Unsupported("plot: tek çizgi dışındaki grafik")
    points = series[0]["points"]
    if len(points) > 24:
        raise Unsupported(f"plot: {len(points)} nokta (en çok 24; fonksiyonsa ifade olarak yazılmalı)")
    x, y = data["xAxis"], data["yAxis"]
    visual = {"kind": "plot", "x": [x["min"], x["max"]], "y": [y["min"], y["max"]],
              "series": {"kind": "line", "values": [{"x": p[0], "y": p[1]} for p in points]}}
    if x.get("label"):
        visual["xLabel"] = x["label"]
    if y.get("label"):
        visual["yLabel"] = y["label"]
    return visual


def climate(data):
    visual = {"kind": "climate", "temperature": data["temperature"], "precipitation": data["precipitation"]}
    station = (data.get("station") or data.get("title") or "").strip()
    if station and station != "İstasyon":
        visual["title"] = station
    return visual


def timeline(data):
    if data.get("periods"):
        raise Unsupported("timeline: dönem çubukları (motorda periods en az 2 dönem, en çok 4 olay işareti)")
    events = data.get("events") or []
    if not 2 <= len(events) <= 8 or any(len(e["label"]) > 40 for e in events):
        raise Unsupported("timeline: 2–8 olay, etiket en çok 40 karakter")
    return {"kind": "timeline", "events": [{k: e[k] for k in ("year", "label", "detail") if e.get(k) is not None} for e in events]}


def pyramid(data):
    visual = {"kind": "pyramid", "pyramids": data["pyramids"]}
    for key in ("layout", "shares"):
        if key in data:
            visual[key] = data[key]
    return visual


def contour(data):
    return {"kind": "contour", **{k: data[k] for k in ("interval", "tint", "notes", "profile") if k in data}}


def map_(data):
    if data.get("baseMapCode") != "TR_PROVINCES" or data.get("regions") or data.get("routes"):
        raise Unsupported("map: yalnız il haritası üstünde nokta işaretleri çevrilir")
    return {"kind": "map", "base": "provinces", "markers": [{"at": [m["lon"], m["lat"]], "label": m["label"]} for m in data.get("markers") or []]}


CONVERTERS = {TABLE: table, CHART: chart, PLOT: plot, CLIMATE: climate, TIMELINE: timeline, PYRAMID: pyramid, CONTOUR: contour, MAP: map_}


def to_visual(kind, data):
    if kind not in CONVERTERS:
        raise Unsupported(f"tür {kind}: motor karşılığı elle seçilmeli")
    return CONVERTERS[kind](data)
