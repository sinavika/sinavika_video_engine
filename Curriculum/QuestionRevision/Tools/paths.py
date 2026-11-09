"""Where the question revision keeps its files.

The work (revisions, reports, tools) lives in Curriculum/QuestionRevision and goes into git; the data pulled from the
live database, the generated results (SQL, figures, lesson reports) and the build of FigureCheck live in
Outputs/QuestionRevision, outside git. The education data is read where it is (Desktop/EgitimVerileri,
`EGITIM_VERILERI` overrides) and never copied.
"""
import os

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
ENGINE = os.path.normpath(os.path.join(ROOT, "..", ".."))
OUTPUT = os.path.join(ENGINE, "Outputs", "QuestionRevision")
DATA = os.path.join(OUTPUT, "Data")
RESULTS = os.path.join(OUTPUT, "Results")
REVISIONS = os.path.join(ROOT, "Revisions")
REPORTS = os.path.join(ROOT, "Reports")
PILOT = os.path.join(ROOT, "Pilot")
FIGURE_CHECK = os.path.join(OUTPUT, "FigureCheck", "bin", "Release", "net8.0", "FigureCheck.dll")
EDUCATION_DATA = os.environ.get("EGITIM_VERILERI") or os.path.join(os.path.expanduser("~"), "Desktop", "EgitimVerileri")
FIGURES = os.path.join(OUTPUT, "Figures")
# Motorun hazır resimleri API'nin kabına içeriklerinin SHA-256 özetiyle yüklenir (API: ContentFigureStillRules).
# Canlı hesap 4 Kasım 2026'dan beri Frankfurt'taki sinavikablobsgwc; eski sinavikasblobs silindi.
# API kayıtta adresi zaten kendi kabına çevirir, ama motor çıktıları da doğru adresi taşısın.
STILL_BASE_URL = "https://sinavikablobsgwc.blob.core.windows.net/work-figure-stills/"
