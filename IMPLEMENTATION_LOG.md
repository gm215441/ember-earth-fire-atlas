# EMBER implementation log

All times and dates use Asia/Karachi unless stated otherwise.

## 2026-11-13 — Phase 00: preflight and tooling

### What exists

- The execution kit was unpacked at the repository root without overwriting an
  existing application; the directory was empty before extraction.
- A current Next.js App Router project exists at `apps/web` with TypeScript,
  Tailwind CSS, ESLint, Vitest, and Playwright Test.
- The root page is an EMBER-specific, no-data preflight shell. Its globe-like
  form is explicitly labelled as a visual shell and does not present fabricated
  observations.
- The typed metric-kind contract includes an explicit `unavailable` state and
  makes validated harmonization the only harmonized metric kind.
- A root Git repository and CI workflow exist. No credentials were created or
  copied; `.env.example` contains only a blank server-side variable.

### Verified software

| Software | Observed version |
| --- | --- |
| Node.js | 24.11.0 |
| npm | 11.6.1 |
| pnpm | 11.25.0 |
| Python | 3.13.17 |
| Git | 2.51.2.windows.1 |
| Codex CLI | 0.167.0-alpha.3.2 |
| Next.js | 16.4.6 |
| React / React DOM | 19.3.0 |
| Tailwind CSS | 4.3.3 |
| Playwright Test | 1.65.0 |
| Vitest | 4.1.12 |

`yarn` and `bun` were not installed. Official Next.js 2026 documentation states
Node.js 20.9 is the minimum; the installed Node.js version satisfies it.

### Connectivity and tools

- A sandboxed `curl` correctly failed DNS resolution; the approved read-only
  connectivity check returned HTTP 200 from official Next.js documentation and
  the documented Source Cooperative `alltime-r5.parquet` object.
- Playwright MCP was added globally. The current desktop session already exposes
  browser control through `cua_repl`; a new session may be needed for the newly
  added MCP entry to become callable.
- Context7 setup reached device authentication and was stopped without assuming
  authorization. To enable it, run `npx ctx7 setup --codex`, choose `MCP server`,
  and complete the browser device login.
- Figma remains intentionally unused because no real design file was supplied.

### Commands and verification

Executed successfully so far:

```text
node --version
npm --version
python --version
git --version
pnpm --version
codex --version
codex mcp list
codex mcp add playwright -- npx -y @playwright/mcp@latest
npm exec --yes create-next-app@latest -- D:\NASA\apps\web ...
npm install --save-dev @playwright/test@1.65.0 vitest@4.0.18
git init
```

The first unpinned Vitest install was rejected by npm because Vitest 5 requires
newer Node type declarations than the generated Next.js project. No force or
legacy-peer-deps override was used; compatible Vitest 4.0.18 was selected from
official npm package metadata.

Final verification:

```text
npm run lint       PASS
npm run typecheck  PASS
npm run test       PASS — 2 tests
npm run build      PASS — / statically prerendered
npm run e2e        PASS — 2 Playwright tests on installed Microsoft Edge
npm audit --omit=dev  PASS — 0 vulnerabilities
```

The full audit initially reported 9 development-only vulnerabilities. A
non-breaking `npm audit fix` removed the Vitest mocker advisories, including the
critical item, and updated Vitest to 4.1.12. Seven moderate advisories remain in
the ESLint/typescript-estree/minimatch development chain; `npm audit fix` cannot
currently remove them without an upstream dependency release.

Visual evidence was rendered and inspected at both required Phase 00 sizes:

- `artifacts/screenshots/phase00-home-1440x900.png`
- `artifacts/screenshots/phase00-home-390x844.png`

Both captures have readable content, no horizontal overflow, and an explicit
statement that the preflight planet contains no scientific observations.

### Data provenance and limitations

No scientific dataset has been downloaded, transformed, or displayed in Phase
00. The only data-source check was a successful HTTP HEAD request against the
documented independent mirror. Schema proof and provenance-bearing outputs are
Phase 01 work. The interface must not be read as a current fire map.

### Next milestone

Phase 01 will inspect the mirror's own instructions and Parquet schemas, record
checksums/retrieval timestamps, and produce the first reproducible real-data
proof without conflating sensors or treating missing coverage as zero.

## 2026-11-13 — Phase 01: real-data proof

### What changed

- Added a pinned DuckDB 2.0.0 Python environment and reproducible source
  inspection, preview-build, and validation scripts under `pipeline/`.
- Read the mirror's current `AGENTS.md` directly and recorded the measured remote
  schemas, object metadata, exact queries, runtimes, and caveats in
  `docs/DATA_PROOF.md`.
- Generated `apps/web/public/data/global-preview.json` from exact daily columns
  in the 2020 and 2025 yearly aggregate files. It contains no random points.

### Evidence and results

- Both exact GeoParquet objects returned HTTP 200. The all-time file was
  3,364,679 bytes; the 2025 r5 file was 2,042,246 bytes.
- All-time `sum(count)` and all monthly buckets both equal 614,362,367.
- 2025 `sum(count)` and all 365 daily buckets both equal 58,352,900.
- January 2020 totals 4,102,854 raw detected pixels; August 2025 totals
  8,403,769. The preview validator confirmed distinct, nonempty cell values.
- Full machine evidence: `artifacts/data/phase01-source-inspection.json`.
- `pipeline/validate_preview.py`: PASS.
- `npm run check`: PASS (lint, typecheck, 4 unit tests, production build).

### Scientific limits

These are raw mixed-fleet detected-pixel counts from an independent mirror of
NASA FIRMS. They are not unique fires, burned area, coverage evidence, or a
harmonized trend. Month-by-sensor conclusions cannot be drawn from these
aggregate cells because the required cross-tab is absent.

## 2026-11-13 — Phase 02: visual foundation

### What changed

- Rebuilt `/` as a cinematic editorial opening frame using the fixed EMBER
  tokens and Space Grotesk / Inter / IBM Plex Mono through `next/font`.
- Added a responsive, data-driven orthographic planet using Phase 01 cells,
  keyboard-accessible period controls, region selection, and working `/explore`
  and `/method` destinations.
- Added truthful loading/error states. The error state explicitly says no
  substitute observations were inserted.

### Verification

- `npm run check`: PASS — lint, typecheck, 4 unit tests, production build.
- `npm run e2e`: PASS — 3 browser tests, including real period switching and
  no-horizontal-overflow assertions at 1440×900 and 390×844.
- First visual pass exposed a hydration warning and mobile dev indicator. Both
  were fixed; the second pass had no browser hydration warning.
- Final inspected screenshots:
  `artifacts/screenshots/phase02-home-1440x900.png` and
  `artifacts/screenshots/phase02-home-390x844.png`.
- Detailed critique and two-pass evidence: `docs/VISUAL_REVIEW.md`.

### Scientific status

Every visible point is derived from the real Phase 01 aggregate preview. The
stage labels the values as raw detected pixels, names the independent mirror,
and states that the mixed-fleet display is not harmonized.

## 2026-11-13 — Phase 03: interactive globe and timeline

### What changed

- Replaced the CSS planet with a dynamically loaded `react-globe.gl` / Three.js
  scene. It uses the complete 1,200-cell Phase 01 display cap, merged into one
  point mesh, with no random coordinates or invented arcs.
- Added drag, wheel, and pinch controls; interaction cancels auto-rotation. A
  globe click returns a latitude/longitude selection and focuses the camera.
  The regional select provides an accessible non-canvas focus path.
- Implemented explicit `idle`, `scrubbing`, `playing`, and `paused` timeline
  states. Dates, totals, and point data change together and remain labeled raw
  mixed-fleet / not harmonized.
- Downloaded the official NASA/GSFC SVS 2048×1024 Blue Marble texture locally.
  The SHA-256 is
  `AE6214B078ED0864C96F74BCB10AE3021F6EB116F8059797EFE0FA9EA8B89D35`;
  full provenance and credit are recorded in `docs/GLOBE_ENGINE.md`.
- Added an SSR-safe, WebGL-unavailable fallback and reduced-motion handling.

### Verification and refinement

- `npm run check`: PASS — lint, strict typecheck, 4 unit tests, production build.
- `npm run e2e`: PASS — 6/6 serialized Edge tests in 54.9 seconds. Tests cover
  actual WebGL readiness, both real months, globe click geolocation, timeline
  state transitions, console errors, and desktop/mobile overflow.
- Visual pass one exposed a container-measurement race that produced different
  globe scales between screenshots. The WebGL component now waits for the first
  `ResizeObserver` measurement, and a second inspected pass shows a stable scale.
- Final evidence:
  `artifacts/screenshots/phase03-home-2025-08-1440x900.png`,
  `artifacts/screenshots/phase03-home-2020-01-1440x900.png`, and
  `artifacts/screenshots/phase03-home-390x844.png`.
- Production builds now use Next.js's Webpack path. Turbopack repeatedly panicked
  while spawning its CSS worker inside the Windows sandbox; Webpack completed
  the same optimized build successfully.

### Scientific status

The global month values remain raw detected-pixel counts from an independent
mirror of NASA FIRMS. Marker height and radius encode a logarithmic transform of
real cell count only; they do not represent flame height, radiative power,
burned area, or unique fires.

## 2026-11-14 — Phase 04: cinematic documentary sequence

### What changed

- Installed GSAP 3.15.1 and `@gsap/react` 2.1.2, then added a four-scene
  ScrollTrigger documentary beneath the existing hero. The page still contains
  only one WebGL engine; the documentary lens is a lightweight projection of
  the same real Phase 01 cells.
- Added purposeful scene transitions, restrained camera scaling, real-month data
  changes, sensor-history captions, a skip link, pause motion, keyboard scene
  controls, a compact linear layout, and reduced-motion behavior.
- Manual documentary month selection locks its state, so scroll callbacks cannot
  overwrite a user's choice. The main hero timeline remains a separate state
  machine and is never controlled by documentary scrolling.
- Made globe click geolocation deterministic with `toGlobeCoords` and a movement
  threshold that distinguishes click selection from drag rotation.
- Marked the temporary `/explore` route as non-instant until Phase 05 replaces it,
  removing the Next.js URL-data warning without fabricating content.

### Regression and refinement

The first story integration disrupted the compact live hero by stacking every
scene inside it. After the user reported the layout regression, the committed
Phase 03 hero and CSS were restored immediately and visually verified. The final
implementation isolates the narrative below the hero. Two subsequent visual
passes removed a visible skip-link leak and a footer overlap.

### Verification

- `npm run check`: PASS — lint, strict TypeScript, 4 unit tests, and production
  Webpack build.
- `npx playwright test --trace on`: PASS — 9/9 Edge tests in 1.8 minutes.
- Globe click stress test: PASS — 3/3 consecutive attempts.
- Evidence: `artifacts/screenshots/phase04-scene-1-1440x900.png`,
  `phase04-scene-2-1440x900.png`, `phase04-scene-4-1440x900.png`,
  `phase04-documentary-390x844.png`, and
  `artifacts/traces/phase04-documentary-playwright.zip`.
- The inspected frames communicate the sequence without voiceover and retain no
  horizontal overflow at 390×844.

### Scientific status

The story captions distinguish a satellite-detected pixel from a unique fire,
label the global series raw/not harmonized, and cite NASA ARSET for platform
history and spatial-resolution context. No cross-sensor trend or causal fire
type is inferred from the aggregate snapshots.

### Post-checkpoint scene redesign

The user rejected the original documentary scene implementation. Review showed
that the criticism was valid: all four chapters reused one globe and changed
mostly copy, scale, and framing; compact layout also placed an oversized visual
before the chapter text. The sequence was rebuilt with four distinct plates:
archive timeline, simultaneous seasonal hemispheres, native sensor-confidence
vocabularies, and a regional coordinate field using real 2025 FIRMS rows. Mobile
now pairs every chapter with its corresponding plate in reading order.

- Added `public/data/story-regions.json`, a 38 KB presentation subset derived
  from the deterministic regional extraction. It contains real source rows and
  keeps full regional counts separate from the display subset.
- Corrected a server/client float-serialization mismatch by fixing all generated
  CSS coordinates and alpha values to deterministic precision.
- `npm run check`: PASS — lint, strict typecheck, 4 unit tests, production build.
- Final complete browser rerun: PASS — 9/9 in 1.4 minutes. An earlier run found
  one obsolete hidden-button assertion; the corrected assertion verifies retained
  documentary state directly.
- Inspected all four 1440×900 chapters and three 390×844 mobile checkpoints.
  Evidence includes `phase04-scene-1` through `phase04-scene-4`,
  `phase04-documentary-390x844.png`, `phase04-sensor-390x844.png`, and
  `phase04-region-390x844.png`.
- After feedback on transition effort, replaced independent text/plate timings
  with one synchronized 620 ms arrival and a section-level nearest-scene snap.
  Explicit navigation now lands on exact scene coordinates. Browser assertions
  verify that both the text and evidence plate are fully visible before capture.

## 2026-11-14 — Phase 05: real regional explorer

### What changed

- Replaced the `/explore` foundation shell with a map-first MapLibre GL 6.18.0
  and deck.gl 9.4.1 explorer. OpenFreeMap Liberty supplies the attributed
  basemap; density is aggregated below zoom 8 and real source rows become
  drillable points at zoom 8 and above.
- Added real 2025 raw detections for verified rectangular Punjab and California
  extents. The pipeline reads only the exact
  `year=2025/detections.parquet` object. Complete daily source counts remain
  separate from the deterministic 200-row-per-sensor-month display cap.
- Implemented UTC start/end, sensor family, satellite platform, SP/NRT, and
  day/night filters. The controls change both full source counts and rendered
  rows. Region, filters, and map camera are retained in the URL.
- Added native-confidence, FRP MW, source quality, UTC acquisition, platform,
  day/night, and coordinates to inspection. MODIS numeric confidence and VIIRS
  categorical confidence remain separate. NRT is marked provisional.
- Added keyboard row inspection, attributed source/provenance drawer, working
  filtered CSV export, exact raw Parquet source link, loading/error states, and
  an honest empty state that does not interpret missing detections as no-fire.

### Real-data evidence

- Source size: 1,031,532,301 bytes; ETag
  `"2db6c91c5df1a801cd7e419d8d2e5d52-16"`; modified 2026-09-10.
- Punjab: 239,359 full source rows, 9,180 displayed rows, 2,704 daily cross-tabs.
- California: 141,384 full source rows, 9,566 displayed rows, 2,892 daily
  cross-tabs.
- Generated client artifact: 5,831,328 bytes. Build record:
  `artifacts/data/phase05-regional-build.json`.
- AOI bounding boxes were verified from OpenStreetMap Nominatim relations
  357988 (Punjab) and 165475 (California) and are explicitly labeled bounding
  boxes, not polygon clips.

### Verification

- `npm run test`: PASS — 8/8 unit tests across three files, including regional
  provenance, AOI containment, exact daily totals, native confidence semantics,
  and SP/NRT retention.
- `npm run typecheck`: PASS. `npm run lint`: PASS.
- `npm run build`: PASS after stopping the live dev server that held a Windows
  `.next` directory lock. The optimized Webpack build completed all routes.
- `npm audit --omit=dev`: PASS — zero production vulnerabilities. The first
  sandboxed attempt had no DNS; the approved network retry completed.
- `npx playwright test`: PASS — 12/12 in 1.1 minutes, covering the globe,
  synchronized documentary, real regional filters, attributed map, exact source
  link, CSV download, URL camera state, empty state, and desktop/mobile overflow.
- Inspected evidence:
  `phase05-explore-punjab-1440x900.png`,
  `phase05-explore-california-1440x900.png`,
  `phase05-explore-controls-390x844.png`, and
  `phase05-explore-map-390x844.png`.

### Scientific status

The interface displays positive thermal-anomaly detections. It does not infer
unique fires, wildfire cause, burned area, confirmed no-fire, or observation
coverage. Mixed sensor rows can be filtered but are not labeled harmonized or
directly comparable. Detailed architecture, data cap, and limitations are in
`docs/REGIONAL_EXPLORER.md`.

## 2026-11-14 — Phase 06: responsible sensor-aware histories

### What changed

- Added a resumable DuckDB Spatial ETL that reads one exact yearly raw
  `detections.parquet` object at a time for 2000–2025, clips the disclosed
  Punjab and California bounding boxes, preserves sensor/platform/quality/
  day-night provenance, and detects duplicates using the complete stated row
  identity rather than a probabilistic hash.
- Exported raw daily and monthly sensor-separated series. MODIS Terra+Aqua SP
  and VIIRS Suomi-NPP SP have separate calendar-month reference profiles;
  NOAA-20 and NOAA-21 remain independent. Reference index 100 means only that
  stream's own seasonal median and is never presented as harmonization.
- Rebuilt `/compare` with independent raw timelines and scales, year/region/
  day-night controls, a fleet timeline, optional within-sensor references,
  and explicit no-equivalence language. Missing months remain unavailable and
  occupy their true elapsed time in the charts.
- Rebuilt `/method`, added `docs/METHOD.md` and `docs/LIMITATIONS.md`, and added
  typed science-contract tests for UTC, target-year exclusion, positive-only
  coverage limits, confidence semantics, and SP/NRT source quality.

### Real-data evidence

- Exact years processed: 26/26 (2000–2025); unavailable years: 0.
- Source rows: 4,904,615; daily groups: 68,040; monthly rows: 3,331.
- Exact duplicate identities removed: 0. This is a measured result, not an
  assumption that nearby or repeated detections are the same fire.
- Seasonal profiles: 48 rows. Each region has 12 MODIS profiles with 22
  available years (2003–2024) and 12 VIIRS SNPP profiles with 12 available
  years (2013–2024); target year 2025 is excluded.
- Outputs: `regional-daily-series.json` 20,529,576 bytes and
  `regional-monthly-series.json` 812,831 bytes. Machine record:
  `artifacts/data/phase06-series-build.json`.

### Verification

- `npm run test`: PASS — 12/12 unit tests. This includes explicit UTC,
  positive-only no-fire gating, raw/non-harmonized labels, baseline exclusion,
  native confidence semantics, and SP/NRT retention.
- `npm run typecheck`: PASS. `npm run lint`: PASS.
- `npx playwright test e2e/compare-method.spec.ts`: PASS — 3/3 against the
  complete historical artifact. The tests exercise raw separation, day/night,
  reference mode, region switching, fleet history, provenance, and desktop/
  mobile overflow.
- `npx playwright test`: PASS — 15/15 in 2.6 minutes, including globe,
  documentary transitions, regional explorer, compare, and method regressions.
- `npm run build`: PASS — Next.js 16.4.6 production Webpack build generated
  `/`, `/compare`, `/explore`, and `/method`. The local preview was restarted at
  `http://localhost:3000` after the build.
- Inspected evidence: `phase06-compare-1440x900.png`,
  `phase06-reference-1440x900.png`, `phase06-fleet-1440x900.png`,
  `phase06-compare-390x844.png`, `phase06-series-390x844.png`, and
  `phase06-method-390x844.png`. The first mobile pass found a 970 px method
  overflow caused by the long reproducible command; the grid min-width and
  code scroller were fixed and the 390 px assertion now passes.

### Scientific status

These are positive thermal-anomaly pixel detections, not unique fires, burned
area, observation coverage, cause, severity, or a combined cross-sensor truth.
No calibration has been accepted. The Portolan catalog remains an independent
mirror of NASA FIRMS, and NRT rows remain provisional.

## 2026-11-14 — Phase 07: burning calendar and prior-year context

### What changed

- Added `/calendar` with synchronized region, sensor stream, UTC year, and UTC
  date query state. The route includes a 12-month activity ribbon, daily pulse
  chart, selectable calendar grid, computed reading, coordinate view, and
  direct Explore/Compare handoffs.
- Added `build_calendar_snapshot.py`, which compacts the verified Phase 06
  series into SP-only MODIS and VIIRS SNPP positive-day rows without filling
  missing days. The UI does not download the 20.5 MB analytical daily artifact.
- Implemented a leakage-safe reference: same-month positive-detection days from
  stable prior years only, excluding the selected year and all future years.
  The UI reports quartiles, median, empirical percentile, sample days/years,
  and `(selected - median) / max(IQR, 1)`. Fewer than 20 days or three years
  produces “not enough comparable history.”
- The 2025 map uses real capped coordinates and keeps the full daily count
  separate. Older years show a coordinate-layer-unavailable state instead of
  invented locations. Date selection changes both the statistics and point
  layer with a restrained transition.
- Added calendar navigation across the globe, explorer, compare, and method
  routes. Compare now accepts region/year/sensor focus from calendar state.

### Real-data evidence

- Calendar artifact: 26,290 positive-day rows, 2,845,715 bytes, two regions,
  two stable streams. Build record: `artifacts/data/phase07-calendar-build.json`.
- Selected visual-evidence slice: Punjab, MODIS SP, 2025-04-29 UTC. The daily
  full count is 195 detected pixels and the coordinate view contains 37 real
  display-sample rows. The score uses 629 prior positive days across 22 years;
  it is labeled context, not a forecast or emergency rating.
- Source remains NASA LANCE FIRMS via the independent Portolan mirror. The map
  coordinates come from the verified `regional-2025.json` display artifact.

### Verification

- `npm run test`: PASS — 16/16. Four new statistical tests prove future and
  selected-year exclusion, missing-as-unavailable behavior, insufficient
  history, and prior-only peak-month derivation.
- `npm run typecheck`: PASS. `npm run lint`: PASS.
- `npx playwright test e2e/calendar.spec.ts`: PASS — 3/3. Date selection changes
  the count, URL, map date, and point count; historical coordinates refuse
  fabrication; Explore/Compare handoff and desktop/mobile overflow pass.
- `npx playwright test`: PASS — 18/18 in 2.7 minutes, including all prior globe,
  documentary, explorer, compare, and method regressions.
- `npm run build`: PASS. The first attempt hit a Windows EPERM lock in generated
  `.next`; after deleting only that verified build directory, the sandboxed
  retry could not resolve the existing Google Fonts. The approved network
  retry completed all eight routes successfully.
- Inspected evidence: `phase07-calendar-1440x900.png`,
  `phase07-days-1440x900.png`, `phase07-map-1440x900.png`,
  `phase07-calendar-390x844.png`, `phase07-days-390x844.png`, and
  `phase07-map-390x844.png`. The first pass exposed the Next dev “1 Insight”
  overlay in local pixels; the dev-only host is now hidden and final captures
  show only application UI.

### Scientific status

The calendar distribution is conditioned on positive-detection days because no
compatible observation mask is present. Its percentile is not all-day fire
probability, forecast, risk, emergency severity, climate attribution, or
cross-sensor truth. Missing days and unavailable historical coordinates remain
explicit.

## 2026-11-15 — Phase 08: held-out calibration experiment

### What changed

- Added the reproducible `ember-overlap-ratio-v1` experiment. It aligns VIIRS
  Suomi-NPP SP monthly counts to the MODIS Terra+Aqua SP reference stream for
  matching positive region-months; MODIS is explicitly not physical fire
  ground truth.
- Used a chronological split: 144 training pairs from 2013–2018 and 144
  held-out pairs from 2019–2024. Compared unadjusted VIIRS, a global median
  MODIS/VIIRS ratio baseline, and a transparent region/calendar-month ratio fit.
- Added predeclared release gates for overall improvement, regional stability,
  year stability, held-out sample size, and geographic breadth. The two-AOI
  result fails geographic breadth, so its status is `unvalidated` and its
  release decision is `keep_sensor_series_separate`.
- Added measured reports and deterministic SVG plots, an experimental-results
  section on `/compare`, and the executed result on `/method`. No unified-index
  toggle is exposed. A typed guard requires validated status, a publish
  decision, and every gate to pass before `validated_harmonized_index` can be
  presented.

### Actual held-out results

- Global ratio baseline: MAE 330.191, RMSE 642.903, median APE 22.001%, sMAPE
  27.420%, R² against MODIS 0.9678.
- Region/season experiment: MAE 238.720, RMSE 518.695, median APE 14.059%,
  sMAPE 19.959%, R² against MODIS 0.9790.
- Overall MAE improved 27.702%. Punjab improved 39.207%; California improved
  only 1.994%. Five of six held-out years improved, but 2020 regressed from
  MAE 340.560 to 390.160.
- Passed four gates; failed geographic breadth because only two independent
  AOIs were available and at least three were required. No confidence interval
  is claimed.

### Verification and evidence

- `pipeline/.venv/Scripts/python.exe pipeline/run_calibration_experiment.py`:
  PASS; generated the JSON reports and both SVG plots from actual overlap data.
- `npm run test`: PASS — 19/19. Three new guard tests prove the executed report
  and any mislabeled failed-gate report cannot appear validated.
- `npm run typecheck`: PASS. `npm run lint`: PASS.
- `npx playwright test e2e/calibration.spec.ts`: PASS — 3/3. The UI shows the
  failed gate and separate-series decision, method discloses the split, no
  validated label appears, and desktop/mobile visual captures pass.
- First full browser run: 20/21; the existing two-desktop/one-mobile explorer
  screenshot test exceeded its global 30-second timeout while the map remained
  healthy. Its timeout alone was raised to 60 seconds; the isolated rerun
  passed in 27.1 seconds. Final full run: PASS — 21/21 in 3.4 minutes.
- `npm run build`: PASS — all eight Next.js routes completed after the preview
  process was stopped; the preview was then restored at `http://localhost:3000`.
- Inspected evidence: `phase08-calibration-1440x900.png`,
  `phase08-calibration-390x844.png`, `phase08-calibration-plot-390x844.png`,
  and `phase08-validation-series-1280x720.png`. The validation plot visibly
  distinguishes MODIS actual, global-ratio baseline, and experimental fit.

### Scientific status

The numerical improvement demonstrates held-out alignment to MODIS in two AOIs,
not fire truth, general regional validity, burned area, risk, forecast skill, or
causal explanation. Sensor histories remain the only published comparison.

## 2026-11-15 — Phase 09: Fire Season Passport

### What changed

- Added `/passport` as the printable endpoint of the Explore and Calendar
  journey. Region, UTC year, named sensor stream, and selected UTC date survive
  in a shareable query string; no credential or secret is placed in the URL.
- Built an editorial evidence sheet rather than a generic report template. It
  includes a computed lead finding, selected-day context, 12-month seasonal
  signature, prior-season context, rectangular analysis extent, record window,
  source badges, snapshot date, validation status, data cautions, and links to
  NASA FIRMS, the Portolan catalog, and EMBER methods.
- Added print-only layout rules and a desktop/mobile `Print / Save PDF` action.
  Playwright now creates one-page A4 and US Letter artifacts in `output/pdf/`.
  The first Letter inspection found the footer alone on page two; print-only
  spacing and chart height were reduced, then both formats were regenerated.
- Added `docs/PASSPORT.md` and browser coverage for state preservation,
  computed facts, citations, mobile print interaction, overflow, screenshots,
  and PDF creation. Calendar and Compare were also given the same explicit
  blocking route mode already used by Explore, removing Next.js URL-data
  navigation warnings without altering route state.

### Computed example and provenance

- Verified sheet: Punjab, MODIS Terra+Aqua SP, 2025, selected date 2025-04-29
  UTC. November has the largest 2025 raw monthly total: 3,156 detected pixels
  across 29 positive-detection UTC days.
- The selected date contains 195 detected pixels and is at the empirical 98.4th
  percentile among 629 April positive-detection days across 22 prior years.
  The selected year and future years are excluded from this context.
- October has the highest median positive-day count in the stable prior MODIS
  record used by the sheet. Missing dates are not converted to zero.
- Sources remain NASA LANCE FIRMS through the independently attributed Portolan
  mirror. The sheet preserves the Phase 08 `unvalidated` calibration status and
  keeps source histories separate.

### Verification and evidence

- `npm run test`: PASS — 19/19 unit tests.
- `npm run typecheck`: PASS. `npm run lint`: PASS after removing a synchronous
  effect-only share-path state update.
- `npx playwright test e2e/passport.spec.ts`: PASS — 3/3.
- `npx playwright test`: PASS — 24/24 in 3.0 minutes across all routes and all
  earlier documentary, globe, explorer, calendar, comparison, and method
  regressions.
- `npx playwright test e2e/calendar.spec.ts e2e/compare-method.spec.ts`: PASS —
  6/6 after the route-warning cleanup; no URL-data navigation warning remained.
- `npm run build`: PASS — Next.js 16.4.6 production Webpack build generated all
  nine application routes, including `/passport` as partial prerendered output.
- `pdfinfo` reports one page at 595.92 x 842.88 points for A4 and one page at
  612 x 792 points for Letter. Final PDF sizes are 180,896 and 180,823 bytes.
  Both were rendered at 144 DPI and inspected for clipping, page breaks, glyph
  corruption, hierarchy, citation readability, and footer placement.
- Browser evidence: `phase09-passport-1440x900.png` and
  `phase09-passport-390x844.png`. Deliverables:
  `output/pdf/ember-punjab-passport-a4.pdf` and
  `output/pdf/ember-punjab-passport-letter.pdf`.

### Scientific status

Passport counts are satellite-detected thermal-anomaly pixels, not unique
fires, burned area, observation coverage, cause, severity, or forecast skill.
The percentile is conditioned on same-month positive-detection days. The
rectangular extent is an analytical AOI, not an administrative boundary.
