"""Deneme (exam) kitapçığı hazırlığının yolları ve ortak yardımcıları. Veritabanına bağlanmaz.

İş (plan, sorular, yönerge) Curriculum/Exams altında git'tedir; canlıdan çekilen katalog, üreticiler,
denetim sonuçları (Results/Exams), figürler (Figures/Exams) ve SQL Outputs/Quizzes altında, git dışındadır."""
import json, os

from paths import EXAMS, EXAM_OUTPUT as EXAM_OUT, EXAM_CATALOG as CATALOG, EXAM_WORK, EXAM_RESULTS, EXAM_FIGURES  # noqa: F401

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
