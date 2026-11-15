# Phase 10 extensions

Phase 10 adds exactly two optional capabilities after the core QA gates passed:
the sensor-separated seasonal analog at `/analogs` and the voice-independent
guided science tour at `/tour`. Neither adds a runtime dependency or an
external credential.

## Region-to-region seasonal analog

The analog uses the verified `seasonalProfiles` rows in
`regional-monthly-series.json`. It operates on one named SP sensor stream at a
time. For each region, the 12 calendar-month median counts are divided by their
12-month sum, creating a within-region seasonal-shape vector. Raw Punjab and
California totals are never compared directly.

EMBER reports cosine similarity for the unshifted vectors, then evaluates all
12 circular month offsets and reports the maximum. For the current artifact:

- MODIS Terra+Aqua SP, 2003-2024 (22 common profile years): direct shape index
  35.7/100; best offset -3 months; offset-aligned index 81.6/100.
- VIIRS Suomi-NPP SP, 2013-2024 (12 common profile years): direct shape index
  26.0/100; best offset -3 months; offset-aligned index 81.1/100.
- Punjab's median-profile peak is November; California's is August in both
  named streams. Target year 2025 is excluded from the profiles.

The index is descriptive, not a probability, validation score, significance
test, forecast, sensor calibration, cause attribution, or claim that the two
regions contain the same kinds of burning. Only two curated AOIs are available.

The pure calculation lives in `src/lib/science/seasonal-analog.ts`; unit tests
load the real public artifact and lock the measured offsets, year counts, peak
months, and similarities.

## Guided science tour

The five-step tour teaches the evidence contract in sequence:

1. A detection is not a unique fire.
2. MODIS and VIIRS histories remain separate.
3. Day context uses only prior same-month positive-detection days.
4. The held-out calibration experiment failed its release gate.
5. The Passport carries selection, provenance, and cautions into print.

The active step is a polite atomic live region. Every step is reachable through
semantic buttons; Previous/Next and left/right arrow keys work without audio,
speech input, dragging, timing, or hover. A keyboard skip link reaches the
active content, visible focus styling is retained, and the mobile progress rail
scrolls internally without widening the document. Query state preserves the
active step.

The facts are read from the compact calendar and calibration artifacts. A load
failure produces an explicit unavailable state and never inserts substitute
scientific claims.
