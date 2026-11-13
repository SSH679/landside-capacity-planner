# Landside 2027 Capacity Planner

Static GitHub Pages app built from the `OP2 Draft Plan` allocation grid (52 allocation rows, 25 people, 53 weeks).

**Capacity rule:** each cell is days per week out of 5 (3 = 60%, 4 = 80%). Utilisation = allocated days / available days, where available = 5 - holiday days (`config.json`).

## Use
- Pages: Settings > Pages > Source: GitHub Actions (workflow in `.github/workflows/pages.yml`).
- Locally: `python3 -m http.server` and open http://localhost:8000.

## Update data
- Edit `allocations.json`, or use the in-page editor > Export JSON > replace file > commit.
- Re-import from Excel: `python3 import_excel.py "Landside 2027 Planner.xlsx"` (needs `openpyxl`).
- Holidays: `config.json` > `holidays` (`week`, `label`, `daysOff`). Seeded from the plan markers (NY, BD1, BD2, CNY, Easter, xmas, NY); add site/country holidays as needed.

## Assumptions to verify
- Week 1 starts 2026-12-28. The workbook header says 2027-12-28 but is labelled 2027 Q1 and Easter falls in week 13, so it looks like a typo.
- BD1/BD2 are treated as 1-day holidays; Christmas week as 2 days.
- Repo is private: it contains team names and allocations.
