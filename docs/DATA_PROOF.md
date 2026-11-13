# Phase 01 data proof

Verified 2026-11-13 from Asia/Karachi. Query timestamps in the machine-readable
evidence are UTC.

## Source identity

NASA LANCE FIRMS is the authoritative producer. The queried files are an
independent Portolan Mirrors republication on Source Cooperative, not a NASA
service. The mirror's current agent guide was read directly from:

`https://raw.githubusercontent.com/portolan-mirrors/firms-catalog/main/catalog/detections/AGENTS.md`

The guide states that one row is a satellite-detected thermal-anomaly pixel, not
a unique fire, that confidence semantics differ by instrument, and that the
aggregates do not contain day-by-sensor cross-tabs. EMBER therefore labels the
Phase 01 outputs as raw mixed-fleet detection counts and not harmonized data.

## Exact remote objects

| Object | HTTP bytes | Last-Modified | ETag |
| --- | ---: | --- | --- |
| `detections/alltime-r5.parquet` | 3,364,679 | Wed, 16 Sep 2026 07:09:15 GMT | `411c75b801bdb86232ff7d1c0ff3e619` |
| `detections/year=2025/aggregate-r5.parquet` | 2,042,246 | Wed, 16 Sep 2026 07:09:15 GMT | `a2406371d84ed8582ef354674541c803` |

Both returned HTTP 200. No wildcard that could include `live.parquet` was used.

## Measured schema

DuckDB 2.0.0 reported 318 columns for all-time r5: `a5_cell UBIGINT`,
`count BIGINT`, 311 monthly `count_YYYYMM` buckets from `count_200011` through
`count_202609`, `sum_frp DOUBLE`, `max_frp DOUBLE`, `avg_frp DOUBLE`,
`geometry GEOMETRY('OGC:CRS84')`, and a bounding-box struct.

The 2025 r5 table reported 379 columns: the common identifiers and FRP fields,
365 daily buckets from `count_20250101` through `count_20251231`, separate
whole-year totals `count_modis`, `count_viirs_snpp`, `count_viirs_noaa20`,
`count_viirs_noaa21`, `count_d`, `count_n`, geometry/bbox, and the hive-derived
`year BIGINT`. There is no `count_<sensor>_<date>` field.

The complete DESCRIBE output is retained in
`artifacts/data/phase01-source-inspection.json`.

## Queries and results

Schema:

```sql
DESCRIBE SELECT * FROM read_parquet('<exact HTTPS object>');
```

Top nonzero cells:

```sql
SELECT a5_cell, count, round(sum_frp, 2) AS sum_frp
FROM read_parquet('<exact HTTPS object>')
ORDER BY count DESC
LIMIT 5;
```

Aggregate integrity:

```sql
SELECT sum(count)::BIGINT FROM read_parquet('<exact HTTPS object>');

SELECT sum(
  coalesce("count_<first bucket>", 0) + ... +
  coalesce("count_<last bucket>", 0)
)::BIGINT
FROM read_parquet('<exact HTTPS object>');
```

Measured totals matched exactly:

| Table | `sum(count)` | bucket sum | top-5 query | total query | bucket validation |
| --- | ---: | ---: | ---: | ---: | ---: |
| alltime-r5 | 614,362,367 | 614,362,367 | 11.1646 s | 5.8921 s | 9.8720 s |
| 2025 aggregate-r5 | 58,352,900 | 58,352,900 | 9.8184 s | 7.4408 s | 10.0821 s |

The highest-count 2025 cell in this snapshot is A5 cell
`1508142925215694848` with 278,050 raw detected pixels and a summed FRP field of
5,483,777.39 MW across its records. This is not a count of fires or burned area.

## Compact globe output

`pipeline/build_global_preview.py` reads exact yearly aggregate objects and sums
the matching daily bucket columns for each requested month. It does not use the
lagging all-time file to answer a year-specific query.

| Period | exact source | daily columns | global raw detected pixels | displayed cells |
| --- | --- | ---: | ---: | ---: |
| 2020-01 | `year=2020/aggregate-r5.parquet` | 31 | 4,102,854 | 1,200 |
| 2025-08 | `year=2025/aggregate-r5.parquet` | 31 | 8,403,769 | 1,200 |

The periods have different global totals and different cell signatures. The
compact output is `apps/web/public/data/global-preview.json`; it includes source
URLs, HTTP metadata, exact bucket names, transformation text, and caveats.

## Reproduction

```powershell
python -m venv pipeline/.venv
pipeline/.venv/Scripts/python.exe -m pip install -r pipeline/requirements.txt
pipeline/.venv/Scripts/python.exe pipeline/inspect_source.py
pipeline/.venv/Scripts/python.exe pipeline/build_global_preview.py
pipeline/.venv/Scripts/python.exe pipeline/validate_preview.py
```

The validation rejects empty or malformed cells, nonpositive totals,
non-reconciling displayed totals, duplicated period signatures, an incorrect
metric kind, or removal of the explicit not-harmonized warning.

## Fallback if the mirror becomes unavailable

No synthetic fallback is permitted. Use the official NASA FIRMS archive at
`https://firms.modaps.eosdis.nasa.gov/download/` for historical files, record the
exact downloaded filenames/checksums, and adapt the pipeline only after probing
their true columns. A recent-data request may use the official area API only
after a user places a private key in `.env.local`; the key is never required for
the historical static demo and never enters a client bundle.
