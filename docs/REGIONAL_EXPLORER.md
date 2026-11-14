# Phase 05 regional explorer

## Real-data artifact

`pipeline/build_regional_snapshot.py` reads only the exact Portolan mirror object
`detections/year=2025/detections.parquet`. It does not use a wildcard, an
aggregate table, or `live.parquet`.

The generated `apps/web/public/data/regional-2025.json` contains:

- complete daily cross-tabs by source sensor, satellite, SP/NRT quality, and
  day/night flag for every source row inside each rectangular AOI;
- a deterministic client display sample capped at 200 rows per sensor and UTC
  month; and
- native confidence, FRP, acquisition time, instrument, satellite, quality,
  source type code, coordinates, and version on every displayed row.

The 2026-11-14 build produced a 5,831,328-byte artifact:

| AOI | Full source rows | Display rows | Daily cross-tab rows |
|---|---:|---:|---:|
| Punjab, Pakistan | 239,359 | 9,180 | 2,704 |
| California, USA | 141,384 | 9,566 | 2,892 |

The source object was 1,031,532,301 bytes, ETag
`"2db6c91c5df1a801cd7e419d8d2e5d52-16"`, and last modified
2026-09-10. Build evidence is in
`artifacts/data/phase05-regional-build.json`.

## AOI verification

The interface explicitly calls both areas rectangular analysis extents, not
polygon clips. The boxes were checked against OpenStreetMap Nominatim on
2026-11-14:

- Punjab relation 357988: west 69.2617570, south 27.7055479, east 75.3814778,
  north 34.0187570.
- California relation 165475: west -124.4820030, south 32.5295236, east
  -114.1307816, north 42.0094990.

## Map stack and interaction

- MapLibre GL JS 6.18.0 renders the basemap.
- deck.gl 9.4.1 uses the first-party `MapLibreOverlay`. Below zoom 8 the display
  sample is an aggregated `HeatmapLayer`; at zoom 8 and above it becomes a
  pickable `ScatterplotLayer`.
- OpenFreeMap Liberty is used without an API key. Its MapLibre style supplies the
  visible `OpenFreeMap © OpenMapTiles Data from OpenStreetMap` attribution. The
  provider documents required attribution and permits public and commercial use:
  https://openfreemap.org/ and https://openfreemap.org/tos/
- Region, date range, sensor family, satellite, SP/NRT, day/night, longitude,
  latitude, and zoom are kept in the URL.
- The inspector and the first five filtered rows provide a keyboard-accessible
  path that does not depend on canvas picking.
- The download action exports only the current deterministic display rows and
  says so in the file name. Full daily source-row counts remain visible in the
  interface.

## Scientific behavior

The map never calls a detection a wildfire. MODIS confidence remains numeric;
VIIRS confidence remains low/nominal/high. NRT rows are identified as
provisional. The empty state says that zero matching positive detections does not
prove observed no-fire or coverage. Raw MODIS and VIIRS counts are filterable but
not presented as harmonized or directly comparable.

## Verification

- `npx playwright test e2e/explore.spec.ts`: PASS — 3/3. Tested real count
  changes, date/sensor/platform/quality filters, honest empty state, URL camera
  state, attributed map load, row inspection, exact source link, CSV download,
  and desktop/mobile overflow.
- Visual evidence:
  `artifacts/screenshots/phase05-explore-punjab-1440x900.png`,
  `phase05-explore-california-1440x900.png`,
  `phase05-explore-controls-390x844.png`, and
  `phase05-explore-map-390x844.png`.
