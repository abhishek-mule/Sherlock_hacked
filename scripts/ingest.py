#!/usr/bin/env python3
"""
Sherlock Hacked — XLSX ingest (local-only)

Reads the two local workbook sources and produces:

  data/full-students.json   124 records x 178 fields (student_data) + MASTER CT-B merge
  data/master-7bt.json      68 records x 15 fields (MASTER 7BT, verbatim)
  data/osint.json           13 records (osint_data)
  data/admissions.json     963 records (admission_data)

These outputs are LOCAL ONLY and are covered by .gitignore (*.xlsx, data/*.json).
The committed fixture fixtures/synthetic/unified-sanitized.json stays sanitized.

Usage:
  python3 scripts/ingest.py                 # uses repo-root workbooks
  python3 scripts/ingest.py --in-dir . --out-dir data
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
from typing import Any

try:
    import openpyxl  # type: ignore
except ImportError:
    sys.exit("openpyxl required:  pip3 install --break-system-packages openpyxl")


def norm(v: Any) -> Any:
    """Normalize a cell value to a JSON-safe scalar."""
    if v is None:
        return ""
    if isinstance(v, (dt.datetime, dt.date)):
        return v.isoformat()[:10] if isinstance(v, dt.date) else v.isoformat()
    if isinstance(v, float) and v.is_integer():
        return int(v)
    if isinstance(v, float):
        return round(v, 4)
    s = str(v).strip()
    if s in ("None", "nan", "NaN"):
        return ""
    return s


def key_of(fn: Any, ln: Any) -> str:
    f = str(fn or "").strip().lower()
    l = str(ln or "").strip().lower()
    return f"{f} {l}".strip()


def read_sheet(ws, header_row: int = 1, first_data_row: int = 2) -> tuple[list[str], list[dict]]:
    """Stream rows (read_only mode): cell-by-cell access is O(n^2), iter_rows is O(n)."""
    grid = ws.iter_rows(values_only=True)

    headers: list[str] = []
    for _ in range(header_row - 1):
        next(grid, None)
    for row in grid:
        if row is None:
            break
        for v in row:
            if v is None or str(v).strip() == "":
                break
            headers.append(str(v).strip())
        break
    if not headers:
        return [], []

    ncols = len(headers)
    rows: list[dict] = []
    for i, row in enumerate(grid, start=first_data_row):
        if i > 5000:
            break
        rec: dict[str, Any] = {}
        empty = True
        for idx in range(ncols):
            val = norm(row[idx] if idx < len(row) else None)
            rec[headers[idx]] = val
            if val != "":
                empty = False
        if not empty:
            rows.append(rec)
    return headers, rows


def read_rows_from(ws, header_row: int, first_data_row: int) -> list[dict]:
    """Same as read_sheet but data may start several rows after the header."""
    return read_sheet(ws, header_row=header_row, first_data_row=first_data_row)[1]


def build_index(rows: list[dict], fn_key: str, ln_key: str) -> dict[str, dict]:
    idx: dict[str, dict] = {}
    for rec in rows:
        k = key_of(rec.get(fn_key), rec.get(ln_key))
        if k:
            idx[k] = rec
    return idx


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--in-dir", default=".", help="directory containing the .xlsx sources")
    ap.add_argument("--out-dir", default="data", help="output directory (gitignored)")
    args = ap.parse_args()

    here = os.path.dirname(os.path.abspath(__file__))
    root = os.path.dirname(here)
    in_dir = args.in_dir if os.path.isabs(args.in_dir) else os.path.join(root, args.in_dir)
    out_dir = args.out_dir if os.path.isabs(args.out_dir) else os.path.join(root, args.out_dir)

    cluster = os.path.join(in_dir, "db_cluster_data.xlsx")
    master = os.path.join(in_dir, "MASTER DATABASE 7BT CT 2026_27 B(2).xlsx")
    for p in (cluster, master):
        if not os.path.exists(p):
            sys.exit(f"missing source workbook: {p}")

    os.makedirs(out_dir, exist_ok=True)

    # ---- source 1: db_cluster_data.xlsx -------------------------------
    wb1 = openpyxl.load_workbook(cluster, read_only=True, data_only=True)
    _, students = read_sheet(wb1["student_data"])
    _, osint_rows = read_sheet(wb1["osint_data"])
    _, admission_rows = read_sheet(wb1["admission_data"])

    # ---- source 2: MASTER 7BT (header on row 1, data from row 4) -----
    wb2 = openpyxl.load_workbook(master, read_only=True, data_only=True)
    sheet = "CT-B" if "CT-B" in wb2.sheetnames else wb2.sheetnames[0]
    master_headers, master_rows = read_sheet(wb2[sheet], header_row=1, first_data_row=4)

    master_idx = build_index(master_rows, "First Name", "Last Name")
    osint_idx: dict[str, dict] = {}
    osint_first_token: dict[str, dict] = {}
    for rec in osint_rows:
        sn = re.sub(r"\s+", " ", str(rec.get("student_name", "")).strip().lower())
        if not sn:
            continue
        osint_idx[sn] = rec
        tok = sn.split()[0]
        osint_first_token.setdefault(tok, rec)
    admission_idx: dict[str, dict] = {}
    for rec in admission_rows:
        nm = re.sub(r"\s+", " ", str(rec.get("full_name", "")).strip().lower())
        if nm:
            admission_idx[nm] = rec

    def osint_for(rec: dict) -> dict | None:
        """Match osint_data on FIRST/LAST, then full NAME, then first-token (loose)."""
        first = str(rec.get("FIRSTNAME", "")).strip().lower()
        for k in (
            key_of(rec.get("FIRSTNAME"), rec.get("LAST NAME")),
            re.sub(r"\s+", " ", str(rec.get("NAME", "")).strip().lower()),
        ):
            if k and k in osint_idx:
                return osint_idx[k]
        if first and first in osint_first_token:
            return osint_first_token[first]
        return None

    # ---- merge: full student_data + master + osint + admission -------
    unified: list[dict] = []
    for s in students:
        rec: dict[str, Any] = dict(s)  # all 178 fields verbatim
        k = key_of(s.get("FIRSTNAME"), s.get("LAST NAME"))
        os_hit = osint_for(s)
        adm_key = re.sub(r"\s+", " ", str(s.get("NAME", "")).strip().lower())
        rec["_sources"] = {
            "db_cluster_data": "student_data",
            "master_7bt": k in master_idx,
            "osint_data": os_hit is not None,
            "admission_data": adm_key in admission_idx,
        }
        if k in master_idx:
            rec["_master"] = master_idx[k]
        if os_hit is not None:
            rec["_osint"] = os_hit
        if adm_key in admission_idx:
            rec["_admission"] = admission_idx[adm_key]
        unified.append(rec)

    written = {
        "full-students.json": unified,
        "master-7bt.json": master_rows,
        "osint.json": osint_rows,
        "admissions.json": admission_rows,
    }
    for name, payload in written.items():
        path = os.path.join(out_dir, name)
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(payload, fh, ensure_ascii=False, indent=1)
        print(f"  wrote {path}  ({len(payload)} records)")

    merged = sum(1 for r in unified if r["_sources"]["master_7bt"])
    with_osint = sum(1 for r in unified if r["_sources"]["osint_data"])
    print(
        f"\n  unified={len(unified)}  master_7bt_merge={merged}  osint_merge={with_osint}\n"
        f"  fields per student record = {len(students[0]) if students else 0} (student_data) "
        f"+ {len(master_headers)} (master)"
    )
    print("  NOTE: outputs are local-only and gitignored. Do not commit.")


if __name__ == "__main__":
    main()
