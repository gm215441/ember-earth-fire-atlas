# EMBER — Codex implementation brief

## Objective
Build EMBER: a cinematic, interactive Earth fire almanac that lets a user choose a location, inspect real historical MODIS/VIIRS detections, explore a month/day calendar, see seasonal comparisons and uncertainty, and export a sourced Fire Season Passport. Scientific harmonization and honest treatment of observation coverage are the core, not decoration.

## Verified resources (checked against public documentation 2026-11-13)

### Data sources
- Official NASA 2026 challenge: https://www.spaceappschallenge.org/2026/challenges/modis-and-viirs-hot-spots/
- Authoritative historical archive: https://firms.modaps.eosdis.nasa.gov/download/
- Official FIRMS area API: https://firms.modaps.eosdis.nasa.gov/api/area — free MAP_KEY, `DAY_RANGE` 1–5, current and dated requests; get MAP_KEY: https://firms.modaps.eosdis.nasa.gov/api/map_key
- Independent (NOT NASA-hosted) public GeoParquet mirror: https://source.coop/portolan-mirrors/firms-catalog
- Mirror source and pipeline: https://github.com/portolan-mirrors/firms-catalog
- Mirror agent recipe and caveats: https://github.com/portolan-mirrors/firms-catalog/blob/main/catalog/detections/AGENTS.md
- Mirror HTTPS Parquet sample: https://data.source.coop/portolan-mirrors/firms-catalog/detections/year=2025/aggregate-r5.parquet
- Mirror all-time aggregate: https://data.source.coop/portolan-mirrors/firms-catalog/detections/alltime-r5.parquet
- MODIS daily fire mask (quality/observation coverage, OPTIONAL phase 2): https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD14A1
- NASA GIBS imagery services (OPTIONAL): https://nasa-gibs.github.io/gibs-api-docs/access-basics/
- NASA Blue Marble source (globe texture/credit): https://science.nasa.gov/resource/blue-marble/

Important: Mirror's A5 aggregates are UNHARMONIZED. Whole-history aggregates count detections across an expanding satellite fleet. Use only for visual discovery/overview and clearly mark "raw detections / not harmonized". The yearly A5 grids can answer day or per-sensor totals separately, but the aggregate data may not include per-day-and-per-sensor breakdown together. Read their schema first. For trustworthy series, use raw detections grouped by sensor and source quality.

### Libraries / repos
- Next.js + React + TypeScript + Tailwind CSS: https://nextjs.org/
- `react-globe.gl` interactive Three.js globe (MIT): https://github.com/vasturiano/react-globe.gl
- `deck.gl` WebGL high-performance spatial layers (MIT): https://github.com/visgl/deck.gl
- `maplibre-gl` base map: https://github.com/maplibre/maplibre-gl-js
- `react-map-gl/maplibre` React integration (use current monorepo, NOT archived react-maplibre): https://github.com/visgl/react-map-gl
- OpenFreeMap basemap: https://tiles.openfreemap.org/styles/liberty ; provider docs https://openfreemap.org/quick_start/
- A5 geospatial cells, consistent with mirror's grids: https://github.com/felixpalmer/a5 ; npm `a5-js`
- DuckDB (Python plus spatial/httpfs) for offline and reproducible spatial ETL: https://duckdb.org/
- `shadcn/ui` accessible UI components and charts: https://github.com/shadcn-ui/ui
- `recharts` charting: https://github.com/recharts/recharts
- `motion` transitions: https://github.com/motiondivision/motion (`motion/react` import)
- `zod` runtime validation: https://github.com/colinhacks/zod
- `@playwright/test` E2E: https://nextjs.org/docs/app/guides/testing/playwright

## Architecture

- `apps/web`: Next.js TypeScript app; presentation and static API route handlers when needed.
- `pipeline`: Python scripts (`duckdb`, `pandas` or `polars`, `scipy`, `pyarrow`) prepare signed-off / validated JSON and GeoJSON snapshots.
- `data/raw`: never commit huge raw files; scripts download/query public GeoParquet or NASA archives.
- `public/data`: compact, versioned, reproducible JSON/GeoJSON for the globe's monthly raw-density visualization, two case-study areas (Punjab, California), per-sensor historical timelines, regional calendar and explanation metadata.
- `docs`: `METHOD.md`, `DATA_SOURCES.md`, `VALIDATION.md`, `LIMITATIONS.md`.

Do not make the public user-facing dashboard depend on a live gigabyte-scale remote query. Generate or cache dataset snapshots offline so the competition demo works reliably; use official FIRMS API for optional recent activity after getting the key. Implement errors/partial-coverage statuses.

## Design specification
Visual identity: midnight navy / charcoal background, restrained ember-orange highlights, bone-white text, exceptional typography, generous spacing, information hierarchy. The product should look like an editorial NASA-grade scientific explorer, not a generic admin dashboard. Respect reduced-motion settings and mobile layout.

Main routes/components:
1. `/` Landing/experience: headline "Every place has a history of burning." Beautiful, draggable 3D globe with Blue Marble-derived texture (verify rights and attribute NASA), atmosphere, restrained glowing activity points from REAL A5 gridded dataset. Timeline for selecting month/year. Click globe to choose AOI/cell and transition to regional explorer. Use Next.js dynamic import with `ssr:false` for the WebGL component; handle WebGL unavailable. Use `react-globe.gl` `pointsData`, `pointsMerge` where selection on points is unnecessary, `onGlobeClick` and `pointOfView`. Do not add imaginary fire propagation arcs.
2. `/explore?region=...&year=...`: 2D MapLibre map with deck.gl points/heatmap and controls for source sensor, date range, day/night, science quality; calendar grid, bar/line seasonal analysis, sourced detection drill-down. Support selected A5 cells and the two curated case-study AOIs. Clearly label boundary approximations for grid-based selections.
3. `/compare`: Raw MODIS vs raw VIIRS observations (different scales) and reference-normalized seasonal indices; optionally show validated calibrated series with method and error bounds. Never call a min-max normalized chart scientifically harmonized.
4. `/passport?region=...`: beautiful printable one-page Fire Season Passport with region, source range, characteristic seasonal months, graphs, caveats, last data update, NASA citation, method link, and a working browser print/save-as-PDF flow. Avoid server-side PDF until core app works.
5. `/method`: transparent definitions, processing steps, limitations, downloaded source provenance and validation results.

## Data pipeline phases
- Phase A (fast discovery, NOT harmonization): Read mirror A5 `alltime-r5.parquet` and individual yearly `aggregate-r5.parquet` to create a small global presentation grid with source and raw-status labels. Read the mirror docs to avoid double-counting its `live.parquet` or accidental `*.parquet` globs. Favor HTTPS and remote column projection.
- Phase B (scientific core): Query raw historical detections for 2 case-study AOIs with DuckDB spatial extension, filter `quality='sp'` for historical analysis; preserve sensor, platform, UTC timestamp, confidence, type, FRP, observed pixel size, day/night, provenance. Keep unknown `type` separate. Treat MODIS confidence 0..100 and VIIRS categories separately. Do not multiply them into fabricated probabilistic weights.
- Phase C (long-term baseline): Build monthly/daily per-region per-sensor detection-pixel counts and FRP with documented area and observation caveats. Construct a MODIS-only long-duration 2000+ reference timeline. Construct VIIRS SNPP-only high-detail 2012+ timeline. Plot comparisons without implying direct count comparability.
- Phase D (experimental calibration; only after validation): Try a simple, interpretable overlap-period seasonal/regional calibration after comparable aggregation and quality screening. Compare with raw count baseline. Use held-out years and (if data supports) held-out AOIs. Persist calibration coefficients, validation metrics, caveats, and result bounds; if metrics aren't convincing, keep it as experimental and do NOT display as a validated single history. A valid 'harmonized' result requires actual calibration, not a unit conversion or a percentile plot.
- Phase E (optional observation validity): Download actual MODIS fire masks and/or documented VIIRS observation-quality products, if feasible, to distinguish cloudy/unknown from observed-no-detection. A table containing only positive fire pixels cannot do this; never fabricate missing-observation coverage from such a table.
- Phase F: Seasonal anomaly statistics, calculated against historical same-month reference values (exclude current year from baseline); quantify dispersion/uncertainty; avoid calling it a prediction or a wildfire alert.

## Concrete data querying notes
Use DuckDB `INSTALL httpfs; LOAD httpfs; INSTALL spatial; LOAD spatial;` and verified HTTPS paths if AWS anonymous config is tricky. Source documentation sample:

```sql
SELECT a5_cell, count, sum_frp
FROM 'https://data.source.coop/portolan-mirrors/firms-catalog/detections/alltime-r5.parquet'
ORDER BY count DESC LIMIT 100;
```

A5 yearly aggregates have per-day columns `count_YYYYMMDD` and totals per sensor; THEY DO NOT necessarily supply per-day-per-sensor split. Read `catalog/detections/AGENTS.md`, `DESCRIBE` raw tables, and query raw `detections.parquet` for science-grade series. For geographical subset, use `ST_Within(geometry, ST_MakeEnvelope(west, south, east, north))` for a bounding box, replacing it with tested polygon clipping if required. For map HTML, use small GeoJSON or compact JSON; never expose hundreds of millions of records client-side.

## Frontend package setup (adjust versions based on compatibility testing)

```bash
npx create-next-app@latest ember --ts --tailwind --eslint --app
cd ember
npm install react-globe.gl three maplibre-gl react-map-gl @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers @deck.gl/geo-layers @deck.gl/react a5-js recharts motion zod lucide-react
npm install -D @playwright/test
```

For maps use `import Map from 'react-map-gl/maplibre'` and `mapStyle='https://tiles.openfreemap.org/styles/liberty'`. See MapLibre v6 worker compatibility in upstream docs; ensure Next.js bundle works. Install/init shadcn/ui separately following current instructions if wanted.

## Acceptance criteria / stop conditions
- Real-data source provenance displayed on every major view.
- 3D globe animates real aggregate activity at acceptable speed; clicking a region opens populated exploration.
- User can select time and region, inspect sources, inspect a calendar, compare separately labelled sensors, see anomaly/seasonal view and export a Fire Season Passport.
- At least two areas have real reproducible historical inputs (Punjab and California). If any isn't supported by fetched sources, use another clearly stated region and disclose why.
- Science: a test verifies MODIS confidence numeric / VIIRS categorical; a test ensures unknown observation isn't silently zero; a test ensures raw mixed counts never carry "harmonized" label; a test ensures reference baseline excludes target year.
- Reliability: no hardcoded fake production counts, no fake confidence intervals, no imaginary links/satellite positions, and no broken navigation. Validate live data access separately and document fallbacks.
- Codex should work in short iterations: run build, tests and browser checks after each major feature; update log and immediately fix blockers. Stop optional features if end-to-end reliability is threatened.

## Implementation order (authoritative campaign)
Follow `PROMPTS/00_PREFLIGHT.md` through `PROMPTS/13_RED_TEAM.md`, one completed and tested milestone at a time. `DESIGN_BIBLE.md`, `SCIENCE_CONTRACT.md`, `QA_ACCEPTANCE.md` and `AGENTS.md` supersede older visual/route wording in this brief. The explicit `/calendar` route is required in addition to the calendar embedded in regional exploration. Phase 10 is optional. If time is short, protect real-data scientific core, working globe, calendar, passport, and QA first.
