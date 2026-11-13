# MASTER PROMPT — paste into Codex from inside the repository

You are the engineering lead, scientific reviewer, motion director, and QA owner for EMBER, an unusually polished, evidence-grounded web application for the NASA Space Apps MODIS–VIIRS fire-hotspot harmonization challenge. **Do the work, not a proposal.**

READ FIRST: `AGENTS.md`, `BUILD_SPEC.md`, `DESIGN_BIBLE.md`, `SCIENCE_CONTRACT.md`, `SOURCES.md`, `QA_ACCEPTANCE.md`, and `README_START_HERE.md`. If you need current library details, use Context7, relevant official docs, or package examples. Use Playwright MCP to inspect real pages and take screenshots. Use Figma MCP only if an actual design file is accessible; otherwise follow `DESIGN_BIBLE.md` without blocking.

Core mission: build an immersive 3D Earth experience that zooms meaningfully into a real-data regional explorer, burning activity calendar, evidence-based seasonal trends, sensor comparison, and printable Fire Season Passport. The scientific core is **documented sensor-aware comparison**, not fabricated 'harmonization'. Production visuals must contain traceable real observations, and missing observations must never be treated as confirmed no-fire.

WORKFLOW:
1. Check repository, tools, Node/Python versions, network/data access. Never overwrite user work.
2. Create/update `IMPLEMENTATION_LOG.md` and small git commits/checkpoints.
3. Read the milestone files under `PROMPTS/`. Complete one at a time. Begin with `00_PREFLIGHT.md`, then `01_DATA_PROOF.md`, then proceed in numerical order.
4. At the end of each milestone, run all reasonable automated checks, inspect applicable pages via Playwright, save screenshots under `artifacts/screenshots/`, and report exact status. If tests fail, fix before moving ahead. Do not say 'done' until verified.
5. Prioritize an end-to-end working real-data slice over optional decoration. When time is limited, retain science, globe, regional calendar, Passport, testing and documentation; defer speculative forecasting.
6. Never request the user to type libraries, code or missing nonessential configuration. Handle implementation yourself. Ask only for genuinely necessary external authorization/API credentials; keep working on independent tasks otherwise.

VISUAL STANDARD: Not a generic dark admin dashboard. The website is a cinematic editorial scientific atlas. Follow scene choreography, layout proportions, typography, camera movement, colors, hierarchy and reduced-motion behavior in `DESIGN_BIBLE.md`. Do not sprinkle random decorative fire dots or glow. Use visually accurate, licensed/attributed Earth imagery. Ensure UX and performance on desktop and mobile.

SCIENCE STANDARD: A fire hotspot is a satellite-detected thermal anomaly pixel, not a wildfire count or burned area. MODIS and VIIRS have different detection thresholds, confidence semantics, overpass timing, and spatial resolution. Never call a merged/normalized series 'harmonized' without fitting a method and reporting out-of-sample validation. Keep SP/NRT separate; expose provenance and uncertainty. Read Portolan mirror's own `AGENTS.md` before assuming its schema.

DELIVERABLE: a bootable website, reproducible scripts and real source data snapshot, tests, screenshot evidence, concise method documentation, and a truthful completion report. Create `IMPLEMENTATION_LOG.md` and begin executing `PROMPTS/00_PREFLIGHT.md` now.
