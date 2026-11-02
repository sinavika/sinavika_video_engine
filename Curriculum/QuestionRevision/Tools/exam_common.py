"""Deneme (exam) kitapçığı hazırlığının yolları ve ortak yardımcıları. Veritabanına bağlanmaz.

İş (plan, sorular, yönerge) Curriculum/QuestionRevision/Exams altında git'tedir; canlıdan çekilen katalog, üreticiler,
denetim sonuçları (Results/Exams), figürler (Figures/Exams) ve SQL Outputs/QuestionRevision altında, git dışındadır."""
import json, os

from paths import ROOT, OUTPUT, FIGURES, RESULTS

EXAMS = os.path.join(ROOT, "Exams")                      # git: DenemePlani.md, YONERGE.md, <ay>/plan.json, <ay>/<kitapçık>/<ders>.jsonl
EXAM_OUT = os.path.join(OUTPUT, "Exams")                 # git dışı
CATALOG = os.path.join(EXAM_OUT, "katalog.json")
EXAM_WORK = os.path.join(EXAM_OUT, "Work")               # üreticiler: Work/<ay>/<kitapçık>/<ders>.py
EXAM_RESULTS = os.path.join(RESULTS, "Exams")            # Results/Exams/<ay>/<kitapçık>/ ve Results/Exams/<ay>/*.sql (render_figures.py ve upload_stills.py "Exams/<ay>[/<kitapçık>]" ile çalışır)
EXAM_FIGURES = os.path.join(FIGURES, "Exams")            # Figures/Exams/<ay>/<kitapçık>/

# Deneme hazırlanan alt kategoriler ve ÖSYM çıkmışlarının EgitimVerileri klasörü (YDT yok).
SUBS = ["YKS_TYT", "YKS_AYT", "KPSS_LISANS", "KPSS_ONLISANS", "KPSS_ORTAOGRETIM"]
OSYM_KLASOR = {"YKS_TYT": "YKS/TYT", "YKS_AYT": "YKS/AYT", "KPSS_LISANS": "KPSS/Lisans",
               "KPSS_ONLISANS": "KPSS/OnlisansOrtaogretim", "KPSS_ORTAOGRETIM": "KPSS/OnlisansOrtaogretim"}
# AYT'de ÖSYM verisi Tarih ve Coğrafya'yı tek ders olarak tutar (TAR1, COG1); Sosyal-2 dersleri aynı konu kodlarını kullanır.
OSYM_DERS = {("YKS_AYT", "TAR2"): "TAR1", ("YKS_AYT", "COG2"): "COG1"}


def oku_json(p):
    return json.load(open(p, encoding="utf-8"))


def katalog():
    if not os.path.exists(CATALOG):
        raise SystemExit(f"Katalog yok: {CATALOG}. Önce exam_catalog.py çalıştırılmalı.")
    return oku_json(CATALOG)


def plan(ay):
    return oku_json(os.path.join(EXAMS, ay, "plan.json"))


def kitapcik(pl, anahtar):
    return next(b for b in pl["kitapciklar"] if b["anahtar"] == anahtar)


def soru_dosyasi(ay, anahtar, ders):
    return os.path.join(EXAMS, ay, anahtar, f"{ders}.jsonl")
