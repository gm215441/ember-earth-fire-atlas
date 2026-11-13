# Scientific contract — what the interface is allowed to claim

## Definitions
- `hotspot_detection`: a sensor-reported active-fire/thermal-anomaly *pixel detection*. One fire may produce many detections. It is NOT unique fires, ignition count, or burned area.
- `raw_count`: count of detections for a named sensor/platform, region, quality class and date range. Across different sensors, not comparable without calibration.
- `frp`: fire radiative power of a detected pixel in MW. Not burned area, property damage or human exposure.
- `coverage`: whether an observation opportunity was available and usable. A positive-only FIRMS detections table does **not** tell us whether a zero-count grid cell was observed cloud-free.
- `seasonal_profile`: statistical distribution of a transparent observation metric by period of calendar year. No causal or predictive claim.
- `anomaly`: deviation from the appropriate same-region, same-season reference. Do not call forecast or fire emergency alert.
- `harmonized_index`: only if documented cross-sensor calibration with held-out evaluation improves an honest, separately reported baseline; cannot be mere arbitrary rescaling.

## Typed metric state (must implement)
- `raw_sensor_count` — always labels source sensor(s), quality and period.
- `modis_reference_index` — MODIS-only long historical reference with documented assumptions; not an absolute fire count.
- `viirs_reference_index` — VIIRS SNPP-only comparative index.
- `experimental_calibration` — unverified or failed out-of-sample metric, shown only in methodological comparisons.
- `validated_harmonized_index` — only when calibration pipeline reports a method and measured success using independent years/regions; transparent unitless index, not physical count of fires.
- `unavailable` — missing/insufficient source observations; cannot be coerced to zero.

## Record schema, to be adapted after inspecting real source columns
```
Observation {
  source_id: string; sensor: 'MODIS'|'VIIRS_SNPP'|'VIIRS_NOAA20'|'VIIRS_NOAA21';
  satellite: string; quality: 'sp'|'nrt'; acq_datetime_utc: ISO8601;
  lat: number; lon: number; frp_mw: number|null; daynight: 'D'|'N'|null;
  confidence_raw: string|null; confidence_pct_modis: number|null;
  type_code: number|null; source_snapshot_utc: ISO8601;
}
SummaryPoint {
  region_id: string; date_utc: string; sensor: Observation['sensor'];
  count: number|null; metric_kind: string; quality: string;
  provenance_id: string; observed_mask_available: boolean;
}
```
Do not invent data-field names when querying mirror: inspect schema first. The mirror has `geometry` rather than `latitude` and `longitude`; DuckDB Spatial `ST_X`/`ST_Y` can read the point. The per-sensor confidence is different: MODIS numeric, VIIRS categorical. `type` may be null for NRT. Historical SCIENCE default should focus `quality = 'sp'` where present and explicitly mark gaps.

## Mandatory data guardrails
1. Do not use `year=*/*.parquet`; would combine detection and aggregate/live and double count. Use exact filename `detections.parquet` or `aggregate-r5.parquet`.
2. Yearly aggregates contain individual day columns and aggregate per-sensor totals, **not per-day-by-sensor cross-tabs**. Such queries require detections parquet.
3. All-time aggregates may lag the current year files. Label snapshot clearly.
4. Filter and group by instrument and satellite when calculating history; the fleet grows over time. Use comparable long-lived streams for long-term reference.
5. Clock/date: acquisition timestamp is UTC; local-date conversion requires explicit timezone/AOI.
6. Ground-truth caution: independent VIIRS observations are not exact truth for MODIS missed fires; matching requires temporal/geographic tolerance and sensitivity caveats.
7. Do not label cloud-obscured regions without an ingested quality-mask product, e.g. MOD14A1 fire mask (`FireMask` classes 4 cloud, 5 non-fire land, 6 unknown, 7–9 detected fire). Aggregate the mask with valid geometry/time. No mask: mark coverage unknown.
8. Forecasts, wildfire-vs-crop categorization, and real-time emergency warnings are OUT OF SCOPE unless subsequently validated and agreed.

## Suggested calibration investigation (research experiment, not guaranteed success)
- Choose common spatial grid/AOI and monthly time buckets; create MODIS-only baseline and VIIRS SNPP history in overlap years, with quality and temporal controls.
- Construct candidate interpretable corrections, e.g. month/region-specific ratio or regression with regularization, documented reference unit.
- Split train/validation chronologically and by region when data supports; measure MAE/RMSE or log-error against a clearly defined target; compare uncalibrated baseline. Include uncertainty intervals using held-out residuals or justified bootstrap.
- Reject combined index if error improvement or stability cannot be demonstrated. Show separate histories and truthful experimental results instead.

## Runtime evidence
Every table/graph/map legend has metric kind, unit, spatial scope, sensor(s), date range, source, processing version and `last_updated`. `DataSources` page documents NASA FIRMS and independent mirror. No production fixture with fabricated scientific values.
