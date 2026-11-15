# EMBER data pipeline

Reproduce Phase 01 from the repository root on Windows PowerShell:

```powershell
python -m venv pipeline/.venv
pipeline/.venv/Scripts/python.exe -m pip install -r pipeline/requirements.txt
pipeline/.venv/Scripts/python.exe pipeline/inspect_source.py
pipeline/.venv/Scripts/python.exe pipeline/build_global_preview.py
pipeline/.venv/Scripts/python.exe pipeline/validate_preview.py
pipeline/.venv/Scripts/python.exe pipeline/build_regional_snapshot.py
pipeline/.venv/Scripts/python.exe pipeline/build_regional_series.py --start-year 2000 --end-year 2025
pipeline/.venv/Scripts/python.exe pipeline/build_calendar_snapshot.py
pipeline/.venv/Scripts/python.exe pipeline/run_calibration_experiment.py
```

The scripts query exact HTTPS filenames. They never use `year=*/*.parquet`, never
combine `live.parquet` with historical rows, and never infer a sensor-by-month
cross-tab from aggregate cells that do not contain one.

`build_regional_snapshot.py` uses only the exact yearly `detections.parquet`
object. It stores complete daily cross-tab counts for the two rectangular AOIs
and a deterministic, capped display sample of real rows for interactive maps.
The cap is 200 rows per source sensor and UTC month; full daily counts are not
sampled.

`build_regional_series.py` scans the same exact yearly raw objects for the
Punjab and California AOIs. It writes sensor/platform/quality/day-night daily
and monthly series, reports exact duplicate identities, and calculates separate
within-stream seasonal reference indices for MODIS and VIIRS SNPP. The target
year is excluded from both baselines. Per-year resumable cache files are written
to `pipeline/cache/regional-series/` and ignored by Git; use `--refresh` only
when intentionally rebuilding a cached source year.

`build_calendar_snapshot.py` compacts the completed daily series into SP-only
MODIS and VIIRS SNPP UTC-day rows for `/calendar`. It never creates rows for
missing days. Calendar reference statistics are computed from stable prior
years only and are covered by deterministic TypeScript unit tests.

`run_calibration_experiment.py` executes the versioned chronological overlap
experiment, compares unadjusted and constant-ratio baselines, evaluates
predeclared release gates, and generates the machine report and SVG plots. A
failed gate sets the report to `unvalidated` and forbids a validated index.
