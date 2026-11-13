"""Quiz araçlarının yolları. Klasörler Curriculum/Tools/engine_paths.py'de tek yerde tanımlıdır; bu dosya o klasörü
(ortak araçlar: common, database, content_api (Sınavika API), anthropic_api (Anthropic), figür hattı) Python yoluna ekler. Her quiz aracı önce bunu içe aktarır."""
import os
import sys

sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "Tools")))

from engine_paths import (  # noqa: E402
    EDUCATION_DATA,
    ENGINE,
    FIGURE_CHECK,
    QUIZ_DATA as DATA,
    QUIZ_FIGURES as FIGURES,
    QUIZ_OUTPUT as OUTPUT,
    QUIZ_RESULTS as RESULTS,
    QUIZ_REVISIONS as REVISIONS,
    QUIZZES as ROOT,
    RENDER_FIGURES_TS,
    STILL_BASE_URL,
    TSX,
)

__all__ = ["DATA", "EDUCATION_DATA", "ENGINE", "FIGURE_CHECK", "FIGURES", "OUTPUT", "RENDER_FIGURES_TS", "RESULTS", "REVISIONS", "ROOT", "STILL_BASE_URL", "TSX"]
