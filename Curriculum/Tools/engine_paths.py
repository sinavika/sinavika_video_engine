"""Bütün modüllerin klasörleri tek yerde (merkezî altyapı, 9 Kasım 2026).

Motor, API ve mobildeki modüllerle aynı adlarla klasörlenir:

    Curriculum/Quizzes   quiz revizyonu (iş, kurallar, raporlar, araçlar)    → Outputs/Quizzes
    Curriculum/Exams     aylık denemeler (plan, kitapçıklar, araçlar)        → Outputs/Exams
    Curriculum/Works     Works konu dosyaları, Curriculum/WorksWritten yazılı dersler → Outputs/Works
    Curriculum/Tools     ortak Python: bu dosya, common, database, content_api (Sınavika API), anthropic_api (Anthropic), figür hattı

Git'e giren iş Curriculum altında, üretilen ve canlıdan çekilen her şey Outputs altında (git dışı) durur. Eğitim
verisi kopyalanmaz, Desktop/EgitimVerileri'den okunur (`EGITIM_VERILERI` değiştirir). Bir araç kendi klasör yolunu
yazmaz; buradan alır. Modül araçları önce kendi `paths.py` dosyasını içe aktarır; o dosya bu klasörü Python yoluna ekler.
"""
import os

TOOLS = os.path.dirname(os.path.abspath(__file__))
ENGINE = os.path.normpath(os.path.join(TOOLS, "..", ".."))
CURRICULUM = os.path.join(ENGINE, "Curriculum")
OUTPUTS = os.path.join(ENGINE, "Outputs")
EDUCATION_DATA = os.environ.get("EGITIM_VERILERI") or os.path.join(os.path.expanduser("~"), "Desktop", "EgitimVerileri")

# Quiz
QUIZZES = os.path.join(CURRICULUM, "Quizzes")
QUIZ_REVISIONS = os.path.join(QUIZZES, "Revisions")
QUIZ_REPORTS = os.path.join(QUIZZES, "Reports")
QUIZ_PILOT = os.path.join(QUIZZES, "Pilot")
QUIZ_OUTPUT = os.path.join(OUTPUTS, "Quizzes")
QUIZ_DATA = os.path.join(QUIZ_OUTPUT, "Data")
QUIZ_RESULTS = os.path.join(QUIZ_OUTPUT, "Results")
QUIZ_FIGURES = os.path.join(QUIZ_OUTPUT, "Figures")

# Deneme
EXAMS = os.path.join(CURRICULUM, "Exams")                 # git: DenemePlani.md, YONERGE.md, <ay>/plan.json, <ay>/<kitapçık>/<ders>.jsonl
EXAM_OUTPUT = os.path.join(OUTPUTS, "Exams")              # git dışı
EXAM_CATALOG = os.path.join(EXAM_OUTPUT, "katalog.json")
EXAM_WORK = os.path.join(EXAM_OUTPUT, "Work")              # üreticiler: Work/<ay>/<kitapçık>/<ders>.py
EXAM_RESULTS = os.path.join(EXAM_OUTPUT, "Results")        # Results/<ay>/<kitapçık>/ ve Results/<ay>/*.sql
EXAM_FIGURES = os.path.join(EXAM_OUTPUT, "Figures")        # Figures/<ay>/<kitapçık>/

# Works
WORKS = os.path.join(CURRICULUM, "Works")
WORKS_WRITTEN = os.path.join(CURRICULUM, "WorksWritten")
WORKS_OUTPUT = os.path.join(OUTPUTS, "Works")
WORKS_FIGURES = os.path.join(WORKS_OUTPUT, "Figures")      # npm run figures; manifest.json yükleme listesi
WORKS_WRITTEN_OUTPUT = os.path.join(WORKS_OUTPUT, "Written")  # works_batch.py kayıtları

# Anthropic istemcisinin tek uygulaması (anthropic_api.py buradan içe aktarır)
SOURCE_PARSING = os.environ.get("SINAVIKA_PARSE") or os.path.join(os.path.expanduser("~"), "Desktop", "sinavika_parse")

# Motorun figür hattı (quiz ve deneme ortak)
RENDER_FIGURES_TS = os.path.join(TOOLS, "RenderFigures.ts")
FIGURE_CHECK = os.path.join(QUIZ_OUTPUT, "FigureCheck", "bin", "Release", "net8.0", "FigureCheck.dll")
TSX = os.path.join(ENGINE, "node_modules", "tsx", "dist", "cli.mjs")
# Motorun hazır resimleri API'nin kabına içeriklerinin SHA-256 özetiyle yüklenir (API: ContentFigureStillRules).
# Canlı hesap 4 Kasım 2026'dan beri Frankfurt'taki sinavikablobsgwc; eski sinavikasblobs silindi.
STILL_BASE_URL = "https://sinavikablobsgwc.blob.core.windows.net/work-figure-stills/"


def _subject(subject):
    """'Exams/<ay>/<kitapçık>' bir denemedir; 'YKS/YKS_TYT/COG' gibi bir ders kodu quiz dersidir."""
    parts = subject.replace("\\", "/").strip("/").split("/")
    return (True, parts[1:]) if parts[0] == "Exams" else (False, parts)


def result_dir(subject):
    """Figür hattının bir ders ya da deneme için sonuç klasörü (liste, stills.json, SQL)."""
    exam, parts = _subject(subject)
    return os.path.join(EXAM_RESULTS if exam else QUIZ_RESULTS, *parts)


def figure_dir(subject):
    """Figür hattının bir ders ya da deneme için çizim klasörü (açık ve koyu SVG, manifest.json)."""
    exam, parts = _subject(subject)
    return os.path.join(EXAM_FIGURES if exam else QUIZ_FIGURES, *parts)
