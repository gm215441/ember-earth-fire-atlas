# EMBER data pipeline

Reproduce Phase 01 from the repository root on Windows PowerShell:

```powershell
python -m venv pipeline/.venv
pipeline/.venv/Scripts/python.exe -m pip install -r pipeline/requirements.txt
pipeline/.venv/Scripts/python.exe pipeline/inspect_source.py
pipeline/.venv/Scripts/python.exe pipeline/build_global_preview.py
pipeline/.venv/Scripts/python.exe pipeline/validate_preview.py
pipeline/.venv/Scripts/python.exe pipeline/build_regional_snapshot.py
```

The scripts query exact HTTPS filenames. They never use `year=*/*.parquet`, never
combine `live.parquet` with historical rows, and never infer a sensor-by-month
cross-tab from aggregate cells that do not contain one.

`build_regional_snapshot.py` uses only the exact yearly `detections.parquet`
object. It stores complete daily cross-tab counts for the two rectangular AOIs
and a deterministic, capped display sample of real rows for interactive maps.
The cap is 200 rows per source sensor and UTC month; full daily counts are not
sampled.
