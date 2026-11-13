# AGENTS.md — authoritative operating rules for Codex

## Mission
Build **EMBER**, a deployable and visually exceptional historical burning activity explorer that responsibly integrates MODIS and VIIRS active-fire data. The website should make decades of burning accessible without making unvalidated scientific claims.

## Order of instructions
Read `MASTER_PROMPT.md`, `BUILD_SPEC.md`, `DESIGN_BIBLE.md`, `SCIENCE_CONTRACT.md`, `QA_ACCEPTANCE.md`, `SOURCES.md`, then `PROMPTS/<phase>.md`. Preserve any existing user code; do not auto-delete. The narrow phase prompt controls immediate task scope, but never overrides these safety/science guardrails.

## Build discipline
- Write actual code. Prefer one verified, complete vertical slice to a sprawling skeleton.
- Use the documented chosen libraries. Do not invent npm packages, APIs, files, calibration results or endpoints. Check package versions/compatibility before use.
- Do not create placeholder data in production paths. Synthetic fixtures only in tests, visibly labeled.
- At every stage run build/lint/typecheck/unit tests; run Playwright for changed UI. Take screenshots for 1440×900 desktop and 390×844 mobile when relevant. If MCP browser fails, use Playwright Test CLI as fallback and document issue.
- Keep a factual `IMPLEMENTATION_LOG.md` of what exists, what's untested, evidence file paths, data snapshot, and open blockers. Save durable checkpoints.
- Don’t claim a prompt or a compile step proves visual correctness. Inspect rendered pixels and interactions.
- Require meaningful empty/error states. Browser failures must not silently switch to fake scientific data.
- Budget WebGL draw calls, GPU memory and downloaded geometry; prefer aggregated cells, lazy-load non-visible scenes; respect `prefers-reduced-motion`.

## Data integrity
- Primary: NASA FIRMS; independent Portolan mirror allowed if transparently attributed and source cross-checked.
- A detection != unique fire; FRP != burned area; zero detections != confirmed no-fire; hotspots don't identify agricultural vs wildfire causes unambiguously.
- Raw MODIS and VIIRS counts are **not directly comparable**. Their confidence values have different semantics; don’t silently convert VIIRS l/n/h to MODIS percentage.
- A public mirror has pre-aggregated A5 grid data. `aggregate-r5` is useful for globe density, not sensor-by-day comparisons. Check schema via `DESCRIBE`/`SUMMARIZE`; raw detection files for cross-tab queries. Do not use `year=*/*.parquet` (would double-count aggregates/live).
- Keep observations classified by `sensor`, `satellite`, `quality`, timestamp, provenance. Keep observation-coverage claims separate; positive-only detection data cannot measure unobserved no-fire area.
- Analytical calibration allowed only after leakage-safe held-out validation, compared with an explicit baseline. If validation fails, show independent sensor histories, not invented combined truth.
- Use UTC internally with correct user-facing date semantics. Exclude target year from its own seasonal baseline.
- Recent/NRT observations are provisional and must be identified; source download timestamp must be visible.

## Credentials and third-party services
- Use `.env.local` for `NASA_FIRMS_MAP_KEY` or optional providers. Provide `.env.example` with blanks; do not expose secrets to client bundles, logs or git.
- Figma MCP is optional unless a design reference URL is actually supplied. Playwright + Context7 recommended. Do not block on nonessential credentials.
- Do not clone and redistribute code or third-party images without license and attribution checks. Follow provider fair-use/API terms.

## Must-have routes
`/` immersive globe narrative; `/explore` regional MapLibre/deck.gl exploration; `/calendar` selectable date and seasonal calendar; `/compare` honest cross-sensor diagnostics; `/passport` printable regional finding sheet; `/method` methodology/data/limits.

## Output at end of each milestone
1. What changed, 2. file paths, 3. commands/tests executed and results, 4. visual evidence, 5. real-data provenance and caveats, 6. blocker/next step. No unsupported claims of success.
