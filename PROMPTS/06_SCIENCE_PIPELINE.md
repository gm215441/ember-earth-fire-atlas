# PROMPT 06 — Responsible sensor-aware regional time series

Build Python ETL for source quality SP MODIS (Terra/Aqua) and VIIRS_SNPP (plus clearly independent NOAA-20/21 streams), confined to chosen AOIs and time partitions. Inspect schema first. Never use yearly `*.parquet` glob; use `year=*/detections.parquet`, filter year explicitly for pruning. Handle geometry via DuckDB spatial or documented geometry conversion; log chosen AOI, dates, sensors, source snapshot. Detect duplicates and verify counts. Export raw monthly/daily series, per-sensor, with metadata. Build long-term MODIS-reference seasonal profile and VIIRS_SNPP profile separately. Include climate/quality caveats.

Implement `/compare` with two honest raw timelines, sensor fleet timeline, explanation of detection differences, optional reference-normalized views **clearly not harmonized**. Test day/night, confidence semantics and acquisition UTC conversions. Implement scientific unit tests on typed metric state and source-quality handling. Save `docs/METHOD.md` and `docs/LIMITATIONS.md` with source links and actual processing assumptions.

ACCEPTANCE: real historical series for at least one AOI and ideally both; reproducible command; tests pass; no raw cross-sensor count labelled equivalent; no unsupported unobserved-area claims; validation not faked.
