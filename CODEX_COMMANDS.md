# Commands and setup notes for Codex to execute (after verifying versions)

## Preflight commands
```bash
node --version
npm --version
python --version
git --version
codex mcp list
```
If CLI tool missing, report prerequisite and proceed with independent setup. Codex is expected to actually install project dependencies using its terminal (with normal user approvals), not simply print these.

## Recommended UI packages (install only when task requires them)
```bash
npm install react-globe.gl three gsap @gsap/react maplibre-gl react-map-gl @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers @deck.gl/react recharts lucide-react zod
npm install -D @playwright/test
npx shadcn@latest init
```
`react-globe.gl` already uses Three.js. No need to install React Three Fiber / drei / postprocessing by default. For animations choose GSAP as main orchestrator, not GSAP plus several competing libraries. Check Next.js/React compatibility at install time. If an installed frontend already exists, adapt and preserve rather than recreating.

## Python pipeline suggested dependencies
```bash
python -m venv .venv
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install duckdb pyarrow polars scipy
```
DuckDB extension commands to test: `INSTALL httpfs; LOAD httpfs; INSTALL spatial; LOAD spatial;`. Be aware extension/network availability and GeoParquet spatial compatibility. Record actual query results and performance.

## Scientific data smoke test (inspect schema before writing advanced queries)
```sql
SELECT a5_cell, count, sum_frp
FROM 'https://data.source.coop/portolan-mirrors/firms-catalog/detections/alltime-r5.parquet'
ORDER BY count DESC LIMIT 10;
```
The above is raw detection aggregation, not harmonized activity. Year aggregate has wider `count_YYYYMMDD` columns. Avoid scanning all yearly detections just to draw the overview.

## Acceptance commands (adapt to actual scripts)
```bash
npm run lint
npm run build
npm run test
npx playwright test
```
Ensure npm test is implemented rather than failing due to missing script. Run browser checks with local development server and actual data before signing off.
