"""Deneme araçlarının yolları. Klasörler Curriculum/Tools/engine_paths.py'de tek yerde tanımlıdır; bu dosya o klasörü
(ortak araçlar: common, database, content_api (Sınavika API), anthropic_api (Anthropic), figür hattı) Python yoluna ekler. Her deneme aracı önce bunu içe aktarır."""
import os
import sys

sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "Tools")))

from engine_paths import (  # noqa: E402
    EDUCATION_DATA,
    ENGINE,
    EXAM_CATALOG,
    EXAM_FIGURES,
    EXAM_OUTPUT,
    EXAM_RESULTS,
    EXAM_WORK,
    EXAMS,
    RENDER_FIGURES_TS,
    STILL_BASE_URL,
    TSX,
)

__all__ = ["EDUCATION_DATA", "ENGINE", "EXAM_CATALOG", "EXAM_FIGURES", "EXAM_OUTPUT", "EXAM_RESULTS", "EXAM_WORK", "EXAMS", "RENDER_FIGURES_TS", "STILL_BASE_URL", "TSX"]
