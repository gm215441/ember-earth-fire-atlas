# EMBER visual review

## Phase 02 — opening frame

Reviewed against `DESIGN_BIBLE.md` at 1440×900 and 390×844 on 2026-11-13.

Final evidence:

- `artifacts/screenshots/phase02-home-1440x900.png`
- `artifacts/screenshots/phase02-home-390x844.png`

First-pass evidence is retained as
`phase02-home-1440x900-iteration1.png` and
`phase02-home-390x844-iteration1.png`.

### Iteration 1 findings

- The 38/62 editorial-to-planet split matched the requested desktop silhouette.
  The globe extends beyond the right edge without obscuring the headline.
- The live data points form a restrained, legible pattern and the global total,
  time period, source, and not-harmonized warning remain attached to the view.
- The desktop source note and globe legend were slightly too small.
- The mobile screenshot contained the Next.js development indicator, which is
  valid developer UI but invalid visual evidence.
- Browser logs revealed a React hydration warning: server/client serialization
  rounded floating CSS values differently.

### Iteration 2 changes

- Rounded projection coordinates, opacity, and point scale before rendering;
  the hydration warning disappeared on the second browser run.
- Disabled only the Next.js route-status development indicator; compile/runtime
  errors remain visible through normal Next.js reporting.
- Increased telemetry/source label size and added explicit automated checks that
  `scrollWidth` does not exceed 1440 or 390 pixels.
- Re-rendered both evidence sizes. The mobile view now contains only product UI.

### Final assessment

| Criterion | Score / 5 | Evidence |
| --- | ---: | --- |
| Cinematic identity | 4 | Editorial scale, restrained ember accents, no dashboard cards |
| Planetary scale | 4 | Right-side planet dominates desktop; full-width mobile reveal |
| Legible data | 4 | Period, global raw count, source, legend, and caveat remain attached |
| Responsive mobile | 4 | No horizontal scroll; controls precede data view; readable 390px layout |
| Navigation | 4 | Semantic nav, region select, CTA, and method link are keyboard controls |
| Motion | 3 | Only interaction transitions exist; cinematic motion is Phase 04 |
| Provenance | 4 | NASA producer, independent mirror, snapshot date, raw-status warning |
| States | 4 | Purpose-built loading and no-substitute error views |

The only score below 4 is motion because Phase 02 deliberately avoids adding
the GSAP/3D choreography before the globe engine exists. The static opening
frame is ready for Phase 03 without a broken or generic hero.
