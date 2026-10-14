"""
The lesson list (Curriculum/Sources/LessonList.csv): exam → category (LessonCategorySub) → lesson (LessonMain)
→ topic (LessonSub) → subtopic (LessonMikro). Every library item is coded against it.
"""
from __future__ import annotations

import csv
import io
from dataclasses import dataclass, field
from functools import lru_cache

from .paths import LESSON_LIST


@dataclass
class Mikro:
    code: str
    id: str
    name: str


@dataclass
class Topic:
    code: str
    id: str
    name: str
    mikros: dict[str, Mikro] = field(default_factory=dict)


@dataclass
class Lesson:
    code: str
    id: str
    name: str
    topics: dict[str, Topic] = field(default_factory=dict)


@dataclass
class Category:
    exam: str
    code: str
    id: str
    name: str
    lessons: dict[str, Lesson] = field(default_factory=dict)


# Library folder of each category. KPSS Önlisans and Ortaöğretim share one folder: their lesson trees are identical.
LIBRARY_FOLDERS = {
    'YKS_TYT': 'YKS/TYT',
    'YKS_AYT': 'YKS/AYT',
    'YKS_YDT': 'YKS/YDT',
    'KPSS_LISANS': 'KPSS/Lisans',
    'KPSS_ONLISANS': 'KPSS/OnlisansOrtaogretim',
    'KPSS_ORTAOGRETIM': 'KPSS/OnlisansOrtaogretim',
    'US_SAT_DIGITAL': 'ABD/SAT',
    'US_ACT_ENHANCED': 'ABD/ACT',
}


def library_folder(category_code: str) -> str:
    if category_code in LIBRARY_FOLDERS:
        return LIBRARY_FOLDERS[category_code]
    if category_code.startswith('US_AP_'):
        return 'ABD/AP/' + category_code[len('US_AP_'):]
    return 'Other/' + category_code


@lru_cache(maxsize=1)
def catalog() -> dict[str, Category]:
    """Categories by code. The CSV has no header; values may be quoted and contain semicolons."""
    text = LESSON_LIST.read_text(encoding='utf-8-sig')
    categories: dict[str, Category] = {}
    for number, cells in enumerate(csv.reader(io.StringIO(text), delimiter=';'), start=1):
        if not any(cell.strip() for cell in cells):
            continue
        if len(cells) != 15:
            raise ValueError(f'Lesson list line {number} has {len(cells)} columns; 15 expected.')
        exam, _, _, category, category_id, category_name, lesson, lesson_id, lesson_name, topic, topic_id, topic_name, mikro, mikro_id, mikro_name = (c.strip() for c in cells)
        entry = categories.setdefault(category, Category(exam, category, category_id, category_name))
        lesson_entry = entry.lessons.setdefault(lesson, Lesson(lesson, lesson_id, lesson_name))
        topic_entry = lesson_entry.topics.setdefault(topic, Topic(topic, topic_id, topic_name))
        topic_entry.mikros[mikro] = Mikro(mikro, mikro_id, mikro_name)
    return categories


def lesson(category_code: str, lesson_code: str | None) -> Lesson | None:
    category = catalog().get(category_code)
    return category.lessons.get(lesson_code) if category and lesson_code else None


def validate(category_code: str, lesson_code: str | None, topic_code: str | None = None, mikro_code: str | None = None) -> tuple[str | None, str | None, str | None]:
    """Keeps only the codes that exist under each other in the lesson list."""
    lesson_entry = lesson(category_code, lesson_code)
    if not lesson_entry:
        return None, None, None
    topic = lesson_entry.topics.get(topic_code or '')
    if not topic:
        return lesson_entry.code, None, None
    mikro = topic.mikros.get(mikro_code or '')
    return lesson_entry.code, topic.code, mikro.code if mikro else None


def find_topic(category_code: str, topic_code: str) -> tuple[str, str] | None:
    """(lesson, topic) for a topic code alone; topic codes are unique within a category."""
    for lesson_entry in catalog()[category_code].lessons.values():
        if topic_code in lesson_entry.topics:
            return lesson_entry.code, topic_code
    return None


def find_mikro(category_code: str, mikro_code: str) -> tuple[str, str, str] | None:
    for lesson_entry in catalog()[category_code].lessons.values():
        for topic in lesson_entry.topics.values():
            if mikro_code in topic.mikros:
                return lesson_entry.code, topic.code, mikro_code
    return None


def outline(category_code: str, lesson_codes: list[str] | None = None) -> str:
    """The lesson tree as compact text, for the coding prompt: one line per subtopic under its topic."""
    lines = []
    for lesson_entry in catalog()[category_code].lessons.values():
        if lesson_codes and lesson_entry.code not in lesson_codes:
            continue
        lines.append(f'# {lesson_entry.code} — {lesson_entry.name}')
        for topic in lesson_entry.topics.values():
            lines.append(f'## {topic.code} — {topic.name}')
            for mikro in topic.mikros.values():
                lines.append(f'- {mikro.code} — {mikro.name}')
    return '\n'.join(lines)
