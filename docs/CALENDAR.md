# EMBER burning calendar

## Data artifact

`pipeline/build_calendar_snapshot.py` reads the verified Phase 06 daily series
and writes `apps/web/public/data/regional-calendar-series.json`. The current
artifact contains 26,290 SP-only positive-day rows for Punjab and California,
split into MODIS Terra+Aqua and VIIRS Suomi-NPP streams. It is 2,845,715 bytes.
No row is created for a missing date.

Reproduce it from the repository root:

```powershell
pipeline/.venv/Scripts/python.exe pipeline/build_calendar_snapshot.py
```

The build record is `artifacts/data/phase07-calendar-build.json`.

## Reference calculation

For a selected positive-detection UTC date, EMBER compares its count with
positive-detection days in the same calendar month from stable prior years of
the same stream. MODIS begins at 2003 and VIIRS SNPP at 2013. The selected year
and all future years are excluded. A score requires at least 20 prior positive
days across three prior years.

The robust score is `(selected count - median) / max(IQR, 1)`. The interface
also exposes the empirical percentile, quartiles, sample days, and sample
years. This positive-day distribution is not a forecast, risk rating,
observation-coverage estimate, or harmonized sensor record.

## Coordinate layer

The selected-date coordinate view uses the deterministic capped real rows in
`regional-2025.json`; its header always shows the separate full daily count.
Earlier dates show an explicit coordinate-layer-unavailable state. They never
receive synthetic points.

## Shared state

Region, year, stream, and UTC date live in `/calendar` query parameters.
“Open this date in Explore” transfers region/date/sensor/SP state. “Compare this
year” transfers region/year and highlights the selected sensor stream.
