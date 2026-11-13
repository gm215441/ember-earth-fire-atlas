# EMBER — Codex execution kit
**Goal:** An evidence-grounded, immersive web experience for NASA's MODIS–VIIRS active-fire harmonization challenge. This is a plan + agent instructions, not a finished app.
**Created:** 2026-11-13. Public URLs and interfaces may change; Codex must check actual docs at install time.

## How to use (do exactly in this order)
1. Create a new empty local folder named `ember` and place **all contents of this kit** at its root. Do not put the entire parent `EMBER_Codex_Execution_Kit` folder inside an unrelated existing Next.js project.
2. Install current Node LTS, Git, and Python 3.11+ if needed. Check `node --version`, `npm --version`, `python --version`, `git --version`. Use current supported versions according to Next.js docs, not guessed versions.
3. Configure optional/recommended Codex MCP connections (below). Authentication requires your action. No service is connected simply because this ZIP mentions it.
4. Launch Codex **inside the project folder**. Paste `MASTER_PROMPT.md` or, better, `PROMPTS/00_PREFLIGHT.md` into Codex first.
5. Then run `PROMPTS/01_DATA_PROOF.md` through `PROMPTS/12_RELEASE.md`, **one at a time**. Have Codex actually finish each task, test it, update `IMPLEMENTATION_LOG.md`, and commit/checkpoint before starting the next. Do not paste 13 prompts simultaneously.
6. If running out of time, finish phases 01–09, then 11–12. The nice-to-have experiments in 10 can be cut. A finished, data-backed project beats an unfinished 3D extravaganza.
7. Run `PROMPTS/13_RED_TEAM.md` after the build, or when a milestone seems suspiciously easy.

## Codex MCP connections — exact commands
Use the terminal with Codex CLI installed, and check its current documentation if a command is rejected.

```bash
# Browser automation + screenshot inspection (recommended)
codex mcp add playwright -- npx -y @playwright/mcp@latest

# Library-documentation access (recommended; may open interactive sign-in)
npx ctx7 setup --codex

# Figma (ONLY if you have or create a Figma file; authentication is interactive)
codex mcp add figma --url https://mcp.figma.com/mcp

# Inspect configured tools
codex mcp list
```

In the Codex app, installing the official **Figma plugin** may be preferable to the manual MCP connection, because it includes Figma-specific skills. If there is no Figma design URL, follow `DESIGN_BIBLE.md` directly; never stop the build solely because Figma is absent. Context7 is not required for Codex to read documentation over the regular web if it has web access.

## NASA access
- Historical baseline: publicly accessible [Portolan FIRMS GeoParquet mirror](https://source.coop/portolan-mirrors/firms-catalog). This is an independent mirror, NOT NASA.
- Official NASA history: https://firms.modaps.eosdis.nasa.gov/download/
- Optional recent data: obtain a free MAP_KEY from https://firms.modaps.eosdis.nasa.gov/api/map_key and put it **only** in local `.env.local` as `NASA_FIRMS_MAP_KEY=...`. Never share it in chats, screenshots, commits, client scripts, or logs.
- The public site must remain operational when the optional live API is unavailable. Clearly show last scientific snapshot date.

## Actual coding libraries
- Website: Next.js App Router, TypeScript, Tailwind, accessible components from shadcn/ui, Lucide icons.
- Globe: `react-globe.gl` (Three.js engine under the hood). Do not stack React Three Fiber on top of it unless a specific custom scene cannot be done cleanly within the existing scene.
- Animations: GSAP with ScrollTrigger and `@gsap/react` for cinematic choreography. Use CSS for simple hover animations. No excessive animation libraries.
- Regional map: MapLibre GL JS + deck.gl, using current compatible React adapters.
- Charts: Recharts; calendar is custom React/CSS grid for precision.
- Pipeline: Python 3.11+, DuckDB (with spatial/httpfs), PyArrow, Polars/pandas, SciPy; use fewer dependencies if enough.
- Browser E2E: Playwright Test and Playwright MCP.
- Imagery: correctly attributed NASA Blue Marble for globe (verify specific asset rights + format); NASA GIBS for optional date-specific imagery; map attribution for tile provider.

## What not to assume
- No hidden existing Figma design. If Figma absent, Codex implements from the detailed design bible.
- No unrestricted cross-year comparability of raw satellite count totals.
- No global full-resolution dataset download to the browser.
- No deployment credentials, Google Earth Engine account, or secret API keys unless explicitly provided.
- No one-click build guarantee: the project needs browser iteration, evidence verification, and possibly user authentication.

## Delivery evidence to demand from Codex
At every phase ask for: changed files, commands run, logs/test results, screenshots or Playwright trace, data provenance if relevant, limitations, and next phase. Zero placeholder success claims.
