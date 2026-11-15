# EMBER Fire Season Passport

## Purpose

`/passport` is a printable regional evidence sheet generated from the same
source-derived state used by the calendar. Region, sensor stream, UTC year, and
selected UTC date are preserved in the query string, so a shared sheet can be
reopened without credentials or client-side secrets.

The sheet is intentionally an evidence summary, not a fire report. Its counts
represent satellite-detected thermal-anomaly pixels, not unique fires or burned
area. Positive-only records cannot prove observation coverage or no-fire days.

## Computed content

The current Punjab example uses the MODIS Terra+Aqua SP stream for 2025 and the
selected date 2025-04-29 UTC. The passport computes its text and graphics from
`regional-calendar-series.json`:

- November has the largest 2025 raw monthly count: 3,156 detected pixels across
  29 positive-detection UTC days.
- The selected date contains 195 detected pixels and is at the empirical 98.4th
  percentile among 629 same-month positive days across 22 prior years.
- October has the highest median positive-day count in the stable prior MODIS
  record used by the passport.

The selected year is excluded from its own prior-year context. Missing dates are
not filled with zero. The 12-month bars use only within-sheet relative lengths
and do not imply cross-sensor equivalence.

## Provenance and limits

The data source is NASA LANCE FIRMS accessed through the independently
attributed Portolan mirror. The sheet names the sensor family, platform set,
quality class, UTC convention, record window, rectangular analysis extent,
artifact snapshot date, and the unvalidated cross-sensor calibration status.
NASA FIRMS, mirror catalog, and EMBER method links are printed on the sheet.

## Print contract

The route supplies a browser `Print / Save PDF` action at desktop and mobile
widths. Print-only CSS removes navigation chrome, preserves color, avoids block
splits, and fits the editorial sheet to one physical page in both A4 and US
Letter formats.

Playwright generates the verified artifacts at:

- `output/pdf/ember-punjab-passport-a4.pdf`
- `output/pdf/ember-punjab-passport-letter.pdf`

Rendered inspection copies are temporary and excluded from version control.
