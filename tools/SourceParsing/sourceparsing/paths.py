"""Where the sources are read from and where the library is written."""
import os
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
LESSON_LIST = REPO / 'Curriculum' / 'Sources' / 'LessonList.csv'

# The parsed, lesson-coded library the video engine reads (git-ignored, like the reference corpus).
LIBRARY = REPO / 'Curriculum' / 'Library'
# Intermediate results: extracted questions and explanations before coding, and the coding decisions.
STAGE = LIBRARY / '_Stage'

# The sorted source books (PDFs) and the copied ReferenceCorpus outputs.
SOURCES = Path(os.environ.get('SINAVIKA_SOURCES', Path.home() / 'Desktop' / 'SinavikaKaynaklar'))
SOURCE_MANIFEST = SOURCES / 'Manifest.json'
