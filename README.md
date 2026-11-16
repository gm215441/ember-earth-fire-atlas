# EMBER — Earth Fire Atlas

EMBER is a deployable historical burning-activity explorer built for the 2026 NASA Space Apps Challenge. It makes the NASA FIRMS MODIS and VIIRS active-fire record easier to explore while keeping the scientific limits visible.

## Live submission

**[Open EMBER — Earth Fire Atlas](https://ember-earth-fire-atlas.readyfloat4.chatgpt.site/)**

This public one-click build includes the complete narrative homepage, explorer, calendar, comparison, passport, methodology, analogs, science tour, and checked-in data snapshot.

[Open the seven-slide project demonstration](submission/EMBER-Space-Apps-Demo-v2.pptx)

## What it includes

- `/` — immersive globe and one-gesture documentary narrative
- `/explore` — regional MapLibre/deck.gl analysis with source-row inspection
- `/calendar` — selectable UTC day and prior-only seasonal context
- `/compare` — independent MODIS and VIIRS histories
- `/passport` — printable regional evidence sheet
- `/method` — data provenance, methodology, validation, and limitations
- `/analogs` — within-sensor seasonal profile comparison
- `/tour` — keyboard-operable science tour

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
cd apps/web
npm install
npm run dev
```

Open `http://localhost:3000`. The checked-in historical snapshot works without a NASA API key. To use optional live NASA FIRMS access, copy `.env.example` to `.env.local` and add `NASA_FIRMS_MAP_KEY` on the server only.

## Verification

```bash
cd apps/web
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright test --project=edge
```

The final local campaign gate passed 21 unit tests and 37 browser tests across desktop and mobile layouts, WebGL fallback, source failure, zero rows, reduced motion, delayed data, keyboard navigation, and print.

## Data and scientific boundaries

EMBER uses NASA LANCE FIRMS active-fire observations through an independently attributed Portolan mirror. The app retains sensor, satellite, timestamp, confidence/quality, and provenance fields.

- A detection is not a unique fire.
- FRP is not burned area.
- No detections does not prove that an area was observed and fire-free.
- MODIS and VIIRS raw counts and confidence values are not directly comparable.
- Experimental cross-sensor calibration failed its release gates, so the public interface keeps sensor histories separate.
- Recent/NRT observations are provisional.

See [SCIENCE_CONTRACT.md](SCIENCE_CONTRACT.md), [docs/METHOD.md](docs/METHOD.md), and [docs/DATA_PROOF.md](docs/DATA_PROOF.md) for the full methodology and provenance record.

## Primary sources

- [NASA FIRMS archive](https://firms.modaps.eosdis.nasa.gov/download/)
- [NASA GSFC Blue Marble](https://svs.gsfc.nasa.gov/2915/)
- [Portolan FIRMS catalog mirror](https://source.coop/portolan-mirrors/firms-catalog)

## AI use

AI tools were used for coding, debugging, and troubleshooting.
