# PROMPT 05 — Real regional map with scientific inspection

Implement `/explore` using MapLibre GL + deck.gl with vetted compatibility and a properly attributed basemap (OpenFreeMap or alternative; verify terms). Build region selection (two curated case studies Punjab, Pakistan and California, USA; use explicit verified AOI extents), time range, sensor/platform, quality SP/NRT, day/night filters and provenance drawer. Use prepared **real observations** from pipeline; max client records appropriate to interactive performance, aggregated heatmap until zoom in, then points. Preserve map zoom/selection in URL, keyboard-accessible region selection, mobile controls.

Scientific tooltips show acquisition UTC, sensor, satellite, confidence in native category/numeric format, FRP MW where present, and record-quality flag. Do not present `type=0` as definitive 'wildfire'. Do not infer coverage/no fire from detection gaps. Add real full load, empty and error states. Integrate calendar and map selections but don't claim validation yet.

ACCEPTANCE: at least one supported region has real, drillable detections; sensor and date toggles actually alter the data, and download/source link works; all controls tested with Playwright; mobile screen usable; nothing fabricated.
