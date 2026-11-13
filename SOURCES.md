# Source registry and verified implementation references (2026-11-13)

## Authoritative data
- NASA FIRMS archive: https://firms.modaps.eosdis.nasa.gov/download/
- NASA FIRMS Area API: https://firms.modaps.eosdis.nasa.gov/api/area  — `csv/[MAP_KEY]/[SOURCE]/[west,south,east,north]/[DAY_RANGE]/[DATE?]`, range 1–5 days. Use server-side keys only.
- NASA FIRMS API key: https://firms.modaps.eosdis.nasa.gov/api/map_key
- NASA Blue Marble imagery/credit: https://science.nasa.gov/resource/blue-marble/
- NASA GIBS service formats and tiles: https://nasa-gibs.github.io/gibs-api-docs/access-basics/
- NASA MODIS daily fire-mask Earth Engine product: https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD14A1 (optional; separate access setup)

## Independent public archive (not NASA-operated)
- Source Cooperative: https://source.coop/portolan-mirrors/firms-catalog
- Canonical repo: https://github.com/portolan-mirrors/firms-catalog
- Essential schema/caveats: https://github.com/portolan-mirrors/firms-catalog/blob/main/catalog/detections/AGENTS.md
- Public explorer to learn from, NOT copy branding/UI: https://portolan-mirrors.github.io/firms-catalog/
- All-time **unharmonized** coarse grid: https://data.source.coop/portolan-mirrors/firms-catalog/detections/alltime-r5.parquet
- Year-specific **unharmonized** coarse grid sample: https://data.source.coop/portolan-mirrors/firms-catalog/detections/year=2025/aggregate-r5.parquet
- Year-specific raw sample: https://data.source.coop/portolan-mirrors/firms-catalog/detections/year=2025/detections.parquet
- Mirror caution: all-time aggregates do not include sensor x month crosstabs; year aggregate has per-day and per-sensor totals separately. `quality` distinguishes SP from NRT. `geometry` contains detection point. Probe actual schema.

## Visual stack and MCP
- react-globe.gl repo and demo examples: https://github.com/vasturiano/react-globe.gl
- globe GL reference: https://globe.gl/
- Three.js: https://threejs.org/docs/
- GSAP React plugin: https://gsap.com/resources/React/
- GSAP install / ScrollTrigger: https://gsap.com/docs/v3/Installation/ and https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- MapLibre: https://maplibre.org/maplibre-gl-js/docs/
- deck.gl: https://deck.gl/docs
- OpenFreeMap quick start: https://openfreemap.org/quick_start/
- shadcn/ui: https://ui.shadcn.com/docs
- Recharts: https://recharts.org/en-US/
- Microsoft Playwright MCP: https://github.com/microsoft/playwright-mcp
- Figma Codex MCP: https://help.figma.com/hc/en-us/articles/39888629089175-Codex-and-Figma-Set-up-the-MCP-server
- Context7 for Codex: https://context7.com/guides/codex-mcp-setup
- Codex MCP docs: https://developers.openai.com/codex/mcp
- Playwright testing: https://playwright.dev/docs/intro

No link here implies an integration is installed, authenticated, licensed for every use, or tested on this machine. Codex must check actual availability and terms. Do not clone entire unrelated codebases in lieu of understanding dependencies.
