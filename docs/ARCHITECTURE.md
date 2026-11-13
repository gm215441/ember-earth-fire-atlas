# EMBER architecture

Last verified: 2026-11-13 (Asia/Karachi)

## Current vertical slice

Phase 00 establishes a buildable application shell and the first executable
science guardrail. It intentionally contains no fire-observation data. Phase 01
will prove the documented Source Cooperative mirror schema and produce the first
traceable snapshot before any data-driven visual enters the user interface.

## Repository shape

- `apps/web`: Next.js 16.4.6 App Router application, React 19.3.0, TypeScript,
  Tailwind CSS 4.3.3.
- `pipeline`: reserved for Python/DuckDB/PyArrow source inspection and snapshot
  generation; it is not created until Phase 01 adds real pipeline code.
- `public/data`: reserved for compact, versioned, provenance-bearing outputs.
- `docs`: architecture, method, provenance, validation, and limitation records.
- `artifacts/screenshots`: browser evidence generated at milestone boundaries.

## Runtime boundaries

The public web app will read compact generated artifacts rather than issuing
browser-side scans over remote multi-year Parquet. Server-only code may use an
optional `NASA_FIRMS_MAP_KEY`; the key remains blank in `.env.example` and must
never use a `NEXT_PUBLIC_` prefix. Historical analysis defaults to SP records
and preserves sensor, platform, time, quality, confidence semantics, and source
snapshot metadata.

## Selected stack

The website follows the kit's documented choices: Next.js App Router,
TypeScript, Tailwind, React Globe GL, GSAP, MapLibre/deck.gl, Recharts, and
Playwright. Only the Phase 00 dependencies are installed now. Python 3.13.17 is
available, but pipeline compatibility will be verified against DuckDB/PyArrow
before Phase 01 pins Python dependencies.

## Tool capability matrix

| Capability | Phase 00 evidence | State |
| --- | --- | --- |
| Browser control | Codex desktop `cua_repl` is enabled; Playwright MCP was added with `codex mcp add playwright -- npx -y @playwright/mcp@latest` | Available; a fresh Codex session may be required to expose the new MCP tools |
| Playwright Test | `@playwright/test` 1.65.0, installed Microsoft Edge channel, and `playwright.config.ts` | Configured and verified |
| Current library docs | Bundled Next.js 16.4.6 docs plus web access to official Next.js documentation | Available |
| Context7 | `npx ctx7 setup --codex` reached device authorization | Blocked only on optional user sign-in |
| Figma | No design URL or Figma connection was supplied | Optional; DESIGN_BIBLE.md is authoritative |

## Technical risks

1. Raw mixed-fleet detection totals are not a harmonized climate record.
2. Positive-only FIRMS observations cannot prove observed no-fire conditions.
3. Remote GeoParquet schema and availability can change; every snapshot needs a
   recorded source URL, retrieval time, schema probe, and checksum.
4. WebGL capability and mobile GPU budgets require a static, accessible fallback.
5. Python 3.13 may be newer than some pipeline wheels; Phase 01 will pin a tested
   environment or use a compatible 3.11/3.12 interpreter if required.
6. The production dependency audit is clean. Seven moderate advisories remain in
   the ESLint/type-aware parsing development graph after non-breaking remediation.
