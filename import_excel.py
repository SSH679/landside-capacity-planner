#!/usr/bin/env python3
"""Regenerate allocations.json from the planner workbook.
Usage: python3 import_excel.py "Landside 2027 Planner.xlsx"
Reads sheet 'OP2 Draft Plan ' rows after the 'Initiatives/Name/Role' header (cols A,B,C, then weeks 1..53).
Cell value = days per week out of 5 (3 = 60%, 4 = 80%)."""
import sys, json, openpyxl
from pathlib import Path
wb = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)
ws = wb['OP2 Draft Plan ']
rows = list(ws.iter_rows(min_row=1, max_row=400, max_col=60, values_only=True))
hdr = next(i for i, r in enumerate(rows) if r[0] == 'Initiatives' and r[1] == 'Name')
NW = 53
out = []
for r in rows[hdr + 1:]:
    if not r[1] or not r[0]:
        continue
    weeks = [int(v) if isinstance(v, (int, float)) else 0 for v in r[3:3 + NW]]
    out.append({"initiative": str(r[0]).strip(), "name": str(r[1]).strip(), "role": str(r[2] or '').strip(), "days": weeks})
Path(__file__).parent.joinpath('allocations.json').write_text(json.dumps(out))
print(len(out), 'allocation rows written')
