# Quality gates — a submission is not "done" until these hold

## Functional
- Landing page loads and shows a real, dated, attributed data-driven globe, with sensible fallback when WebGL missing.
- Globe pointer drag/zoom and region selection work; time control changes plotted real aggregates (not just labels).
- Regional map loads for a curated Punjab AOI and a contrasting AOI with real snapshots; selecting a region updates URL and linked views.
- Daily/monthly calendar updates with location/date and never makes missing data look like zero.
- MODIS and VIIRS comparisons are separately labelled; sensor toggle changes the underlying observation selection and explanatory labels.
- `/method` contains definitions, provenance, known limitations and actual validation results (or states unvalidated).
- `/passport` prints to A4/Letter without clipped charts, source links, or loss of legends.
- Errors and offline/blocked sources are handled without unlabelled fabricated data.

## Science checks (must be unit tests)
- MODIS confidence raw numeric and VIIRS l/n/h never blindly equated.
- `quality=sp` vs `nrt` preserved and surfaced.
- Source date, year and sensor filtering cannot double count live or aggregates.
- No per-day-by-sensor conclusion from an aggregate that lacks that cross-tab.
- Raw mixed fleet counts never use `harmonized` designation.
- No observation is represented as confirmed `no_fire` without observed mask.
- Seasonal baseline excludes evaluation period/year.
- Calibration outputs require actual held-out validation metadata.

## Visual and technical
- 1440×900, 1280×720, 390×844, 360×740: no overlap, clipping, horizontal scroll or unreadable 10px controls.
- Globe useful within a few seconds on desktop with snapshot data; lazy-load and cap rendered cells. Prefer data-driven degradation over infinite spinners.
- Respect `prefers-reduced-motion`; keyboard can reach selector, calendar, compare, export; focus ring; screen-reader labels; non-color legend.
- Check browser console and network responses; no uncaught exceptions or broken production URLs.
- Perform at least 1 Playwright E2E test for every core route and key user story.

## Handoff report
The release notes must include actual commands, pass/fail status, screenshots, a reproducible pipeline invocation, data snapshot date, and limitations. If something isn't finished, name it rather than replacing it with claims or demo-only fake values.
