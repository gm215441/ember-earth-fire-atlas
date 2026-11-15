# EMBER adversarial visual QA report

Date: 2026-11-15  
Scope: `/`, `/explore`, `/calendar`, `/compare`, `/passport`, `/method`

## Outcome

No severity-1 or unresolved severity-2 defect remains in the audited routes. The complete browser regression gate passed 37 of 37 tests after two intentional visual polish passes. Lint, TypeScript, 21 unit tests, and the Next.js production build also passed.

The Chrome DevTools performance MCP was unavailable in this environment. In accordance with `AGENTS.md`, the audit used Playwright Test with browser PerformanceObserver and navigation timing as the fallback. This limitation prevents a Lighthouse/Core Web Vitals lab score claim.

## Viewport matrix

Every core route was rendered and captured at:

- 1440 × 900
- 1280 × 720
- 390 × 844
- 360 × 740

Evidence is stored in `artifacts/screenshots/qa/` using the pattern `<route>-<viewport>.png`. The folder also contains `home-webgl-fallback-1280x720.png`.

## Deficiencies and disposition

| Severity | Finding | Disposition |
| --- | --- | --- |
| 2 | The homepage header crowded `EMBER` and `EXPLORE` together at 360 px. | Fixed with a narrow breakpoint that reduces spacing and removes the secondary Methodology link while preserving Explore, Calendar, and Compare. |
| 2 | The Compare header crowded the brand and route links at 360 px. | Fixed with a narrow breakpoint that reduces nav spacing and hides only the Method link. |
| 2 | The mobile Explorer placed filters before the map, contrary to the map-first mobile hierarchy in `DESIGN_BIBLE.md`. | Fixed with explicit flex ordering: map, controls, inspector. |
| 2 | Initial QA screenshots could capture the homepage fallback or Explorer loading shell before the real globe/map was ready. | Fixed the evidence harness to require `data-globe-ready="true"` and `data-map-loaded="true"` before capture. This was a test-evidence defect, not a production fallback defect. |
| 3 | WebGL startup produced 9 long tasks in the final full-suite sample. | Open performance watch item. CLS was 0, LCP 1,068 ms, and load event 1,627 ms on the local test machine; no interaction or acceptance threshold failed. |
| 3 | The Method section rail scrolls horizontally at 360 px, so the final item is offscreen until the user swipes the rail. | Accepted. The rail stays inside the document width, remains keyboard accessible, and avoids shrinking labels below the design system’s legibility floor. |

## Polish pass 1

- Repaired both 360 px header collisions.
- Changed the Explorer’s mobile information order to map-first.
- Tightened capture readiness so visual evidence represents the completed globe and map.
- Re-ran the four-size route matrix: 8 of 8 QA scenarios passed.

## Polish pass 2

- Inspected the regenerated pixels at full size for the globe silhouette, map attribution, narrow headers, map-first explorer, comparison hierarchy, Passport, and Method page.
- Confirmed no body-level horizontal overflow at any audited viewport.
- Confirmed all text and evidence plates remain fully visible in the 1280 × 720 documentary scene.
- Kept the Method rail scrollable instead of reducing type to an illegible size.

## Failure and accessibility evidence

- WebGL unavailable: accessible real-data Earth fallback appears and retains the Atlas link.
- Source unavailable: Explorer shows an explicit error and states that no substitute data was inserted.
- Zero matching rows: Explorer states that zero detections do not prove observation or a fire-free area.
- Reduced motion: enhanced documentary motion remains disabled.
- Slow data: Calendar exposes a loading status before rendering.
- Keyboard only: native controls receive visible focus and the Passport print action is reachable.
- Print: A4 and US Letter Passport artifacts remain one page each.

## Final verification

- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run test`: 21/21 pass
- `npm run build`: pass; 11 application routes generated
- `npx playwright test --project=edge`: 37/37 pass in 6.1 minutes
- Final local performance sample: CLS 0, LCP 1,068 ms, DOM content loaded 1,026 ms, load event 1,627 ms, 9 long tasks

The browser logged a non-fatal luma.gl shader-layout warning while rendering the aggregation layer. No browser console error, local HTTP failure, attribution failure, or functional regression occurred.
