# EMBER implementation log

All times and dates use Asia/Karachi unless stated otherwise.

## 2026-11-13 — Phase 00: preflight and tooling

### What exists

- The execution kit was unpacked at the repository root without overwriting an
  existing application; the directory was empty before extraction.
- A current Next.js App Router project exists at `apps/web` with TypeScript,
  Tailwind CSS, ESLint, Vitest, and Playwright Test.
- The root page is an EMBER-specific, no-data preflight shell. Its globe-like
  form is explicitly labelled as a visual shell and does not present fabricated
  observations.
- The typed metric-kind contract includes an explicit `unavailable` state and
  makes validated harmonization the only harmonized metric kind.
- A root Git repository and CI workflow exist. No credentials were created or
  copied; `.env.example` contains only a blank server-side variable.

### Verified software

| Software | Observed version |
| --- | --- |
| Node.js | 24.11.0 |
| npm | 11.6.1 |
| pnpm | 11.25.0 |
| Python | 3.13.17 |
| Git | 2.51.2.windows.1 |
| Codex CLI | 0.167.0-alpha.3.2 |
| Next.js | 16.4.6 |
| React / React DOM | 19.3.0 |
| Tailwind CSS | 4.3.3 |
| Playwright Test | 1.65.0 |
| Vitest | 4.1.12 |

`yarn` and `bun` were not installed. Official Next.js 2026 documentation states
Node.js 20.9 is the minimum; the installed Node.js version satisfies it.

### Connectivity and tools

- A sandboxed `curl` correctly failed DNS resolution; the approved read-only
  connectivity check returned HTTP 200 from official Next.js documentation and
  the documented Source Cooperative `alltime-r5.parquet` object.
- Playwright MCP was added globally. The current desktop session already exposes
  browser control through `cua_repl`; a new session may be needed for the newly
  added MCP entry to become callable.
- Context7 setup reached device authentication and was stopped without assuming
  authorization. To enable it, run `npx ctx7 setup --codex`, choose `MCP server`,
  and complete the browser device login.
- Figma remains intentionally unused because no real design file was supplied.

### Commands and verification

Executed successfully so far:

```text
node --version
npm --version
python --version
git --version
pnpm --version
codex --version
codex mcp list
codex mcp add playwright -- npx -y @playwright/mcp@latest
npm exec --yes create-next-app@latest -- D:\NASA\apps\web ...
npm install --save-dev @playwright/test@1.65.0 vitest@4.0.18
git init
```

The first unpinned Vitest install was rejected by npm because Vitest 5 requires
newer Node type declarations than the generated Next.js project. No force or
legacy-peer-deps override was used; compatible Vitest 4.0.18 was selected from
official npm package metadata.

Final verification:

```text
npm run lint       PASS
npm run typecheck  PASS
npm run test       PASS — 2 tests
npm run build      PASS — / statically prerendered
npm run e2e        PASS — 2 Playwright tests on installed Microsoft Edge
npm audit --omit=dev  PASS — 0 vulnerabilities
```

The full audit initially reported 9 development-only vulnerabilities. A
non-breaking `npm audit fix` removed the Vitest mocker advisories, including the
critical item, and updated Vitest to 4.1.12. Seven moderate advisories remain in
the ESLint/typescript-estree/minimatch development chain; `npm audit fix` cannot
currently remove them without an upstream dependency release.

Visual evidence was rendered and inspected at both required Phase 00 sizes:

- `artifacts/screenshots/phase00-home-1440x900.png`
- `artifacts/screenshots/phase00-home-390x844.png`

Both captures have readable content, no horizontal overflow, and an explicit
statement that the preflight planet contains no scientific observations.

### Data provenance and limitations

No scientific dataset has been downloaded, transformed, or displayed in Phase
00. The only data-source check was a successful HTTP HEAD request against the
documented independent mirror. Schema proof and provenance-bearing outputs are
Phase 01 work. The interface must not be read as a current fire map.

### Next milestone

Phase 01 will inspect the mirror's own instructions and Parquet schemas, record
checksums/retrieval timestamps, and produce the first reproducible real-data
proof without conflating sensors or treating missing coverage as zero.
