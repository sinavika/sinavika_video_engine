"""
Question extraction from text PDFs by layout.

A page is read as lines with their positions; lines go into columns and are read column by column.
A question starts at a number marker ("12." or "12)") on the column's left edge, and only when the
number is the one expected next (numbering may restart at a new test section, e.g. Genel Kültür).
Options are A)…E) in order; their text is what follows the letter on the same row and below it.
Every question keeps the page areas it covers, so figures can be cropped from the PDF later.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

import fitz

DEFAULT_NOISE = [
    r'Diğer sayfaya geçiniz', r'^Ö ?S ?Y ?M$', r'telif hakları', r'izni olmaksızın', r'kişi, kurum veya kuruluş',
    r'TEST BİTTİ', r'Cevaplarınızı', r'Bu testte \d+ soru vardır', r'^\d{4}-KPSS', r'^-?\s*\d+\s*-?$',
]


@dataclass
class Layout:
    columns: int = 0                    # 0: detect per page; 1 or 2
    header: float = 0.055               # top share of the page ignored (running headers)
    footer: float = 0.065               # bottom share ignored (page numbers, "Diğer sayfaya geçiniz")
    pages: tuple[int, int | None] = (0, None)
    skip_pages: frozenset[int] = frozenset()
    noise: list[str] = field(default_factory=lambda: list(DEFAULT_NOISE))
    number: str = r'^(\d{1,3})\s*[.)]\s*(.*)$'
    option: str = r'^([A-E])\s*\)\s*(.*)$'
    answer: str = r'DOĞRU\s+CEVAP\s*:?\s*([A-E])\b'
    margin: float = 22                  # how far right of the column edge a number marker may sit


@dataclass
class Line:
    page: int
    x0: float
    y0: float
    x1: float
    y1: float
    text: str
    size: float
    column: int = 0


@dataclass
class Draft:
    section: int
    number: int
    stem: list[str] = field(default_factory=list)
    options: list[dict] = field(default_factory=list)
    trailing: list[str] = field(default_factory=list)
    answer: str | None = None
    segments: list[list] = field(default_factory=list)    # [page, column, x0, y0, x1, y1]
    last_y: float = 0
    option_x: float = 0
    warnings: list[str] = field(default_factory=list)

    def touch(self, line: Line, column_box: tuple[float, float]):
        if self.segments and self.segments[-1][0] == line.page and self.segments[-1][1] == line.column:
            segment = self.segments[-1]
            segment[3] = min(segment[3], line.y0)
            segment[5] = max(segment[5], line.y1)
        else:
            self.segments.append([line.page, line.column, column_box[0], line.y0, column_box[1], line.y1])
        self.last_y = line.y1


# Text only: without this flag every call also decodes the page's images, which is what made big books slow.
TEXT_FLAGS = fitz.TEXTFLAGS_DICT & ~fitz.TEXT_PRESERVE_IMAGES
_DICTS: dict[tuple[str, int], dict] = {}


def page_dict(page: fitz.Page) -> dict:
    """The page's text structure, kept for the last few documents (a PDF is read by several passes)."""
    key = (page.parent.name, page.number)
    if key not in _DICTS:
        if len(_DICTS) > 4000:
            _DICTS.clear()
        _DICTS[key] = page.get_text('dict', flags=TEXT_FLAGS)
    return _DICTS[key]


def page_lines(page: fitz.Page, index: int) -> list[Line]:
    lines = []
    for block in page_dict(page)['blocks']:
        if block.get('type') != 0:
            continue
        for line in block['lines']:
            spans = [span for span in line['spans'] if span['text'].strip()]
            if not spans:
                continue
            text = ''.join(span['text'] for span in line['spans']).strip()
            x0, y0, x1, y1 = line['bbox']
            lines.append(Line(index, x0, y0, x1, y1, text, max(span['size'] for span in spans)))
    return lines


def _running_key(line: Line) -> str:
    return re.sub(r'\d+', '#', line.text.strip().lower())


def _is_running(line: Line, height: float, running: set[str]) -> bool:
    return (line.y0 < height * 0.14 or line.y1 > height * 0.86) and _running_key(line) in running


def _running_lines(doc: fitz.Document, first: int, last: int) -> set[str]:
    """Running headers and footers: the same line near the top or bottom of at least a quarter of the pages."""
    counts: dict[str, int] = {}
    for index in range(first, last + 1):
        height = doc[index].rect.height
        keys = {_running_key(l) for l in page_lines(doc[index], index) if l.y0 < height * 0.14 or l.y1 > height * 0.86}
        for key in keys:
            counts[key] = counts.get(key, 0) + 1
    pages = last - first + 1
    # Question numbers near the top of the page are not running lines, however often they are there.
    return {key for key, count in counts.items() if count >= max(3, pages / 4) and re.search(r'[a-zçğıöşü]', key)}


def _reading_order(lines: list[Line]) -> list[Line]:
    """Column by column, top to bottom; lines on the same row left to right."""
    lines = sorted(lines, key=lambda l: (l.page, l.column, l.y0, l.x0))
    ordered, row = [], []
    for line in lines:
        if row and (line.page != row[0].page or line.column != row[0].column or line.y0 - row[0].y0 > 3):
            ordered += sorted(row, key=lambda l: l.x0)
            row = []
        row.append(line)
    return ordered + sorted(row, key=lambda l: l.x0)


KEY_ROW = re.compile(r'^[A-E]\s*(\d{1,3}\s*[).\-]\s*[A-E]\b|$)')   # "1)A 2)D" or a lone "1) A"
LEAD_BREAK = re.compile(r'(\d{1,3}\s*[).\-]\s*[A-E]\b)|cevap|anahtar|testi\b|test\s*\d|^[^a-zçğıöşü]{6,}$', re.I)


def _lead_in(lines: list[str]) -> list[str]:
    """The lines after the last answer key, test title or all-caps heading: the passage that leads into the next question."""
    last = -1
    for index, line in enumerate(lines):
        if LEAD_BREAK.search(line.strip()):
            last = index
    return lines[last + 1:]


def _split_inline_options(text: str) -> list[tuple[str, str]] | None:
    """'A) 12  B) 15  C) 18' on one line → [(A, 12), (B, 15), (C, 18)]."""
    parts = re.split(r'(?:(?<=\s)|^)([A-E])\s*\)\s*', text)
    if len(parts) < 5 or parts[0].strip():
        return None
    letters = parts[1::2]
    if ''.join(letters) not in 'ABCDE':
        return None
    return list(zip(letters, [p.strip() for p in parts[2::2]]))


def extract(path: str, layout: Layout) -> tuple[list[Draft], dict]:
    doc = fitz.open(path)
    noise = [re.compile(p, re.I) for p in layout.noise]
    number_re, option_re, answer_re = re.compile(layout.number), re.compile(layout.option), re.compile(layout.answer)
    first, last = layout.pages[0], layout.pages[1] if layout.pages[1] is not None else doc.page_count - 1
    if last < 0:
        last += doc.page_count

    running = _running_lines(doc, first, last)
    stream: list[Line] = []
    column_boxes: dict[tuple[int, int], tuple[float, float]] = {}
    column_left: dict[tuple[int, int], float] = {}
    for index in range(first, last + 1):
        if index in layout.skip_pages:
            continue
        page = doc[index]
        width, height = page.rect.width, page.rect.height
        lines = [l for l in page_lines(page, index)
                 if height * layout.header <= l.y0 and l.y1 <= height * (1 - layout.footer)
                 and not any(p.search(l.text) for p in noise) and not _is_running(l, height, running)]
        mid = width / 2
        columns = layout.columns or (2 if sum(1 for l in lines if l.x0 > mid - 8) >= 3 and sum(1 for l in lines if l.x1 < mid + 8) >= 3 else 1)
        for line in lines:
            line.column = 0 if columns == 1 or (line.x0 + line.x1) / 2 < mid else 1
        for column in range(columns):
            members = [l for l in lines if l.column == column]
            # The column edge is set by lines inside the column; a centred title reaching over the gutter does not move it.
            inside = [l for l in members if columns == 1 or (l.x1 <= mid + 5 if column == 0 else l.x0 >= mid - 5)] or members
            if members:
                column_left[(index, column)] = min(l.x0 for l in inside)
                column_boxes[(index, column)] = (column_left[(index, column)], max(l.x1 for l in inside))
        stream += lines

    drafts: list[Draft] = []
    current: Draft | None = None
    section, expected = 0, 1
    for line in _reading_order(stream):
        text = line.text
        answer = answer_re.search(text)
        if answer and current is not None:
            current.answer = answer.group(1)
            text = answer_re.sub('', text).strip()
            if not text:
                continue
        marker = number_re.match(text)
        if marker and KEY_ROW.match(marker.group(2)):
            marker = None   # "1)A 2)D 3)B": an answer-key row, not a question
        if marker and line.x0 <= column_left.get((line.page, line.column), 0) + layout.margin:
            n = int(marker.group(1))
            restart = n == 1 and current is not None and current.number >= 5
            if n == expected or n == expected + 1 or restart:
                if current is not None:
                    drafts.append(current)
                if restart:
                    section += 1
                previous = current
                current = Draft(section, n)
                # Text after the previous question's last option that stood apart from it is this question's lead-in
                # (a passage or table some books print above the number).
                if previous is not None and previous.trailing:
                    current.stem += _lead_in(previous.trailing)
                    previous.trailing = []
                if n == expected + 1 and not restart:
                    current.warnings.append(f'soru {expected} bulunamadı')
                expected = n + 1
                current.touch(line, column_boxes[(line.page, line.column)])
                if marker.group(2).strip():
                    current.stem.append(marker.group(2).strip())
                continue
        if current is None:
            continue
        same_area = bool(current.segments) and current.segments[-1][0] == line.page and current.segments[-1][1] == line.column
        gap = line.y0 - current.last_y if same_area else 99
        current.touch(line, column_boxes[(line.page, line.column)])
        inline = _split_inline_options(text)
        if inline and len(current.options) < 5 and inline[0][0] == 'ABCDE'[len(current.options)]:
            for key, value in inline:
                current.options.append({'key': key, 'text': value})
            current.option_x = line.x0
            continue
        option = option_re.match(text)
        if option and len(current.options) < 5 and option.group(1) == 'ABCDE'[len(current.options)]:
            current.options.append({'key': option.group(1), 'text': option.group(2).strip()})
            current.option_x = line.x0
            continue
        if current.options:
            done = len(current.options) == 5 and (gap > 6 or bool(current.trailing))
            if not done and (len(current.options) < 5 or line.x0 >= current.option_x - 2):
                current.options[-1]['text'] += '\n' + text
            else:
                current.trailing.append(text)
        else:
            current.stem.append(text)
    if current is not None:
        drafts.append(current)

    for draft in drafts:
        if len(draft.options) not in (0, 4, 5):
            draft.warnings.append(f'{len(draft.options)} şık bulundu')
        if any(not o['text'].strip() for o in draft.options):
            draft.warnings.append('şık metni boş (formül ya da görsel)')
        if not draft.stem:
            draft.warnings.append('soru metni yok')
    # Numbered lists that are not questions (exam rules on the cover, answer-key pages) have no options: drop them.
    sections: dict[int, list[Draft]] = {}
    for draft in drafts:
        sections.setdefault(draft.section, []).append(draft)
    kept = [group for _, group in sorted(sections.items()) if sum(len(d.options) >= 4 for d in group) >= len(group) / 2]
    drafts = []
    for number, group in enumerate(kept):
        for draft in group:
            draft.section = number
            drafts.append(draft)
    info = {'pages': doc.page_count, 'sections': len(kept), 'droppedSections': len(sections) - len(kept)}
    return drafts, info


class Shapes:
    """Images and drawings per page, without the ones that recur on many pages (watermarks, frames, logos)."""

    def __init__(self, doc: fitz.Document):
        self.doc = doc
        self.pages: dict[int, list[fitz.Rect]] = {}
        counts: dict[tuple, int] = {}
        raw: dict[int, list[fitz.Rect]] = {}
        for index in range(doc.page_count):
            page = doc[index]
            rects = [fitz.Rect(i['bbox']) for i in page.get_image_info()]
            rects += [d['rect'] for d in page.get_drawings() if d['rect'].width > 6 and d['rect'].height > 6]
            raw[index] = rects
            for key in {tuple(round(v / 4) for v in r) for r in rects}:
                counts[key] = counts.get(key, 0) + 1
        common = {key for key, count in counts.items() if count >= max(3, doc.page_count * 0.3)}
        for index, rects in raw.items():
            self.pages[index] = [r for r in rects if tuple(round(v / 4) for v in r) not in common]

    def in_area(self, page: int, area: fitz.Rect) -> list[fitz.Rect]:
        """Shapes that sit mostly inside the area; frames and panels drawn around a whole column do not count."""
        found = []
        for r in self.pages.get(page, []):
            if not r.intersects(area):
                continue
            overlap = fitz.Rect(r) & area
            if overlap.get_area() < 0.5 * r.get_area():
                continue
            if r.width >= area.width * 0.9 and r.height >= area.height * 0.9:
                continue   # a box around the question (a frame, not a figure)
            found.append(r)
        return found


def has_figure(shapes: Shapes, draft: Draft) -> bool:
    """An image or a drawing inside the question's area: a figure, map, table or a formula set as a picture."""
    for page_index, _, x0, y0, x1, y1 in draft.segments:
        if shapes.in_area(page_index, fitz.Rect(x0 - 3, y0 - 3, x1 + 3, y1 + 3)):
            return True
    return False


def regions(draft: Draft) -> list[dict]:
    return [{'page': p + 1, 'bbox': [round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)]} for p, _, x0, y0, x1, y1 in draft.segments]


# ---------------------------------------------------------------- answer keys

KEY_NUMBER = re.compile(r'^(\d{1,3})[.)\-–]?$')
KEY_LETTER = re.compile(r'^\(?([A-E])\)?[.,]?$')
KEY_JOINED = re.compile(r'^(\d{1,3})[.)\-–]([A-E])$')
CORRECTED = re.compile(r'(\d{1,3})\.\s*sorunun\s+doğru\s+cevabı.*?([A-E])\s+olarak\s+düzeltil', re.I | re.S)
CANCELLED = re.compile(r'(\d{1,3})\.\s*soru\S*\s.*?iptal', re.I)


def _key_pairs(page: fitz.Page) -> list[tuple[float, float, int, str]]:
    """(x, y, number, letter): a number word with a letter word right after it on the same row."""
    words = sorted(page.get_text('words'), key=lambda w: (round(w[1] / 4), w[0]))
    pairs = []
    for index, word in enumerate(words):
        joined = KEY_JOINED.match(word[4])
        if joined:
            pairs.append((word[0], word[1], int(joined.group(1)), joined.group(2)))
            continue
        number = KEY_NUMBER.match(word[4])
        if not number:
            continue
        for other in words[index + 1:index + 4]:
            if abs(other[1] - word[1]) < 5 and 0 <= other[0] - word[2] < 70 and KEY_LETTER.match(other[4]):
                pairs.append((word[0], word[1], int(number.group(1)), KEY_LETTER.match(other[4]).group(1)))
                break
    return pairs


def key_pages(path: str, minimum: int = 20) -> list[int]:
    """Pages with an answer key; keys are at the end of a booklet, so the last pages are tried first."""
    doc = fitz.open(path)
    tail = [i for i in range(max(0, doc.page_count - 4), doc.page_count) if len(_key_pairs(doc[i])) >= minimum]
    return tail or [i for i in range(doc.page_count) if len(_key_pairs(doc[i])) >= minimum]


def answer_key(path: str, pages: list[int] | None = None, headers: list[str] | None = None) -> tuple[dict[tuple[int, int], str], dict]:
    """
    (section, number) → letter, from answer-key pages (found automatically when not given).
    With headers (plain text, e.g. GENEL YETENEK, GENEL KÜLTÜR) each entry belongs to the header of its column, or the
    nearest header above it, or the last one on an earlier page; without, a number seen again opens the next section.
    Corrections printed under the key ("38. sorunun doğru cevabı … E olarak düzeltilmiştir") and cancelled questions
    are applied and reported.
    """
    doc = fitz.open(path)
    pages = key_pages(path) if pages is None else [p if p >= 0 else doc.page_count + p for p in pages]
    key: dict[tuple[int, int], str] = {}
    notes = {'pages': [p + 1 for p in pages], 'corrected': [], 'cancelled': []}
    last_section = 0
    seen: set[int] = set()
    for index in pages:
        page = doc[index]
        titles = []
        for section, header in enumerate(headers or []):
            titles += [(r.x0, r.y0, section) for r in page.search_for(header)]
        for x, y, number, letter in sorted(_key_pairs(page), key=lambda p: (p[0] // 80, p[1])):
            if headers:
                above = [t for t in titles if t[1] <= y + 2]
                if above:  # the header over this column of the key: horizontally closest, then lowest
                    last_section = min(above, key=lambda t: (round(abs(t[0] - x) / 60), -t[1]))[2]
                section = last_section
            else:
                if number in seen:
                    last_section += 1
                    seen = set()
                seen.add(number)
                section = last_section
            key.setdefault((section, number), letter)
        text = page.get_text()
        for match in CORRECTED.finditer(text):
            notes['corrected'].append(match.group(0)[:160])
            for (section, number) in list(key):
                if number == int(match.group(1)) and section == last_section:
                    key[(section, number)] = match.group(2)
        for match in CANCELLED.finditer(text):
            notes['cancelled'].append(match.group(0)[:160])
    return key, notes
