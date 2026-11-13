# Phase 03 globe engine

## Rendering architecture

The home-page Earth is a client-only `react-globe.gl` scene, loaded through a
Next.js dynamic import with server rendering disabled for the Three.js canvas.
The server and first client frame render a deterministic accessible fallback.
The WebGL component mounts only after a `ResizeObserver` has measured its final
container, which prevents the camera-scale race found during visual review.

Each selected period renders at most the 1,200 Phase 01 A5 centroids. Marker
latitude, longitude, and counts come directly from `global-preview.json`.
Marker radius and altitude use a logarithmic transform of the real cell count;
the coordinates are never randomized. `pointsMerge` pools the points into a
single mesh for lower draw-call overhead. No trajectory arcs are rendered.

The controls support drag, wheel, and pinch through OrbitControls. Auto-rotation
is disabled when controls begin an interaction, when a location is focused, or
when a user clicks the globe. Globe clicks return latitude/longitude, show the
coordinate in a live status region, and animate the camera to that point. The
region select provides the same focus operation without requiring a canvas.

## Timeline state

The timeline uses four explicit states: `idle`, `scrubbing`, `playing`, and
`paused`. Direct period selection enters `scrubbing` for the update frame and
then returns to `idle`. Playback advances only across periods actually present
in the checked preview; interaction pauses playback. Both visible date and
global total are bound to the selected real period.

## Earth texture provenance

- Asset: `apps/web/public/images/bluemarble-2048.png`
- Source: NASA Goddard Scientific Visualization Studio, visualization 2915,
  `bluemarble-2048.png` (2048 × 1024 equirectangular PNG)
- Source page: https://svs.gsfc.nasa.gov/2915
- Direct NASA asset: https://svs.gsfc.nasa.gov/vis/a000000/a002900/a002915/bluemarble-2048.png
- Credit requested by source: NASA/GSFC Scientific Visualization Studio; Blue
  Marble data courtesy of Reto Stöckli (NASA/GSFC) and NASA Earth Observatory
- Local SHA-256:
  `AE6214B078ED0864C96F74BCB10AE3021F6EB116F8059797EFE0FA9EA8B89D35`
- Local size: 1,511,379 bytes

The source and author credit remain visible beside the globe.

## Verification

`npm run check` passes lint, strict TypeScript, four unit tests, and the
production Webpack build. The Phase 03 Edge suite runs serially so a laptop is
not forced to create several simultaneous WebGL contexts; all six tests pass in
54.9 seconds. Individual functional checks complete in 3.8–9.3 seconds with the
development compiler active. The suite verifies WebGL readiness, both real
periods, click-to-coordinate selection, timeline transitions, responsive
overflow, and console errors.

Inspected evidence:

- `artifacts/screenshots/phase03-home-2025-08-1440x900.png`
- `artifacts/screenshots/phase03-home-2020-01-1440x900.png`
- `artifacts/screenshots/phase03-home-390x844.png`

The two desktop images use the same stabilized camera scale and visibly distinct
real period data. The mobile image has no horizontal overflow. The only warning
observed outside the clean Playwright console assertion came from an installed
browser extension injecting attributes into `<html>` before hydration; the root
layout now suppresses that external attribute mismatch without suppressing
component-level hydration errors.
