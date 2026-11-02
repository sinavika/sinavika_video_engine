"""Canlı veritabanına SALT OKUNUR bağlantı. Yalnız SELECT çalıştırır."""
import json, re, pyodbc

SECRETS = r"C:\Users\onurc\source\repos\sinavika\Configuration\appsettings.Secrets.local.json"

def connect():
    cs = json.load(open(SECRETS, encoding="utf-8-sig"))["ConnectionStrings"]["DatabaseConnection"]
    parts = dict(p.split("=", 1) for p in cs.split(";") if "=" in p)
    server = parts["Server"]
    odbc = (f"DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={server};DATABASE={parts['Initial Catalog']};"
            f"UID={parts['User ID']};PWD={parts['Password']};Encrypt=yes;TrustServerCertificate=no;"
            "ApplicationIntent=ReadOnly;Connection Timeout=30")
    con = pyodbc.connect(odbc, autocommit=True)
    con.execute("SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED")
    return con

_ALLOWED = re.compile(r"^\s*(--[^\n]*\n\s*)*(SELECT|WITH)\b", re.I)
_FORBIDDEN = re.compile(r"\b(INSERT|UPDATE|DELETE|MERGE|DROP|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|GRANT|DENY)\b", re.I)

def query(con, sql, *params):
    if not _ALLOWED.match(sql) or _FORBIDDEN.search(re.sub(r"'[^']*'", "''", sql)):
        raise ValueError("Yalnız SELECT sorgularına izin var.")
    cur = con.cursor()
    cur.execute(sql, *params)
    cols = [c[0] for c in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]
