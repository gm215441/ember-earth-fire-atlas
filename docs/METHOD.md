# EMBER method

## Scope and units

EMBER works with NASA LANCE FIRMS active-fire / thermal-anomaly detections. One
row is one sensor-reported detected pixel. The primary count unit is therefore
**satellite-detected thermal-anomaly pixels**, not fires, ignitions, hectares,
severity, emissions, or damage.

NASA FIRMS is the authoritative producer. Historical processing uses the
independent Portolan mirror on Source Cooperative:
https://source.coop/portolan-mirrors/firms-catalog. The exact yearly objects are
`detections/year={YYYY}/detections.parquet`.

## Reproducible extraction

From the repository root:

```powershell
pipeline/.venv/Scripts/python.exe pipeline/build_regional_series.py --start-year 2000 --end-year 2025
```

The script:

1. inspects the raw schema with DuckDB 2.0.0;
2. scans one exact `detections.parquet` object per year and applies an explicit
   year predicate;
3. uses DuckDB Spatial `ST_Within` with the disclosed Punjab and California
   rectangular AOIs;
4. retains sensor, satellite, SP/NRT quality, acquisition UTC date, day/night,
   native confidence, FRP, type code and source snapshot metadata;
5. identifies exact duplicate identities using acquisition UTC, sensor,
   satellite, quality, FRP, day/night, native confidence, type code and point
   coordinates; and
6. exports daily and monthly sensor-separated series plus duplicate accounting.

It never uses `year=*/*.parquet`, which could combine raw detections with
aggregate or live objects. Per-year cache files under `pipeline/cache/` make the
remote scan resumable and are not production data artifacts.

### Current reproducible snapshot

The Phase 06 build completed at `2026-11-14T10:54:33Z` with all 26 requested
years (2000–2025) available. Across the two disclosed AOIs it processed
4,904,615 source rows into 68,040 daily groups and 3,331 monthly rows. No rows
matched the full exact-duplicate identity in this snapshot. The outputs are
`apps/web/public/data/regional-daily-series.json` (20,529,576 bytes) and
`apps/web/public/data/regional-monthly-series.json` (812,831 bytes); the
machine-readable build record is `artifacts/data/phase06-series-build.json`.

## Sensor-aware series

- **MODIS reference stream:** source sensor `MODIS`, SP quality, Terra and Aqua
  retained as platforms. Raw platform rows are exported; the MODIS panel sums
  the named Terra+Aqua stream.
- **VIIRS SNPP reference stream:** source sensor `VIIRS_SNPP`, SP quality,
  Suomi-NPP only.
- **NOAA-20 and NOAA-21:** remain independent source streams. Their rows are not
  appended to the VIIRS SNPP reference history. NRT quality remains provisional.

MODIS confidence stays numeric (0–100 in the source). VIIRS confidence stays in
its native low / nominal / high categories. EMBER does not convert one into the
other.

## Seasonal reference indices

Two separate, unitless contextual views are calculated:

- `modis_reference_index`: MODIS-only 2003–2024 calendar-month baseline;
- `viirs_reference_index`: VIIRS SNPP-only 2013–2024 calendar-month baseline.

For a given region and calendar month, 100 means that stream's own median raw
count during its documented baseline. The target year 2025 is excluded from
both baselines. The index is not a physical fire count and is not harmonization.
It may help compare a sensor with its own seasonal history; it must not be used
to claim MODIS and VIIRS equivalence.

Months with no positive-detection row are unavailable. The pipeline does not
fill them with zero or interpolate across them. The chart path breaks across
missing calendar months and preserves their elapsed horizontal time.

## Time

Source `acq_datetime` and `acq_date` are interpreted as UTC. Internal dates and
filters remain UTC. The current regional views do not relabel records into local
civil dates. Unit tests reject acquisition timestamps that omit an explicit `Z`.

## Validation status

The separate raw series and within-sensor reference indices are descriptive.
No cross-sensor calibrated series has been accepted. A later calibration phase
may run a leakage-safe held-out experiment, but it will remain experimental
unless it outperforms an explicit baseline on unseen time and region splits.

## Primary references

- NASA FIRMS archive: https://firms.modaps.eosdis.nasa.gov/download/
- NASA FIRMS Area API: https://firms.modaps.eosdis.nasa.gov/api/area/
- NASA ARSET fire-detection reference:
  https://disasters.nasa.gov/sites/default/files/2023-03/D1P5_FireDetection_Final.pdf
- Portolan FIRMS catalog: https://source.coop/portolan-mirrors/firms-catalog
