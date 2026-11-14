# Phase 04 cinematic story

## Structure

The documentary sequence is a separate section below the verified Phase 03
hero. This preserves the original hero composition and keeps a single WebGL
engine on the page. The story uses a lightweight orthographic data lens derived
from the same real Phase 01 A5 centroids; it does not create a second Three.js
scene or invent satellite imagery.

On viewports at least 901 pixels wide, GSAP ScrollTrigger holds the documentary
stage while four markers activate:

1. detections are pixels, not unique fires;
2. two checked months show different seasonal spatial pulses;
3. MODIS and VIIRS have different platform histories and sampling behavior;
4. regional evidence begins with a named place and source context.

The camera effect is a restrained scale/translation of the data lens. Scene
transitions also switch between the two real preview months. A user's explicit
month choice sets a lock, after which scrolling cannot overwrite that choice.
The Phase 03 hero timeline is entirely outside the story state and remains
independent.

## Lifecycle and accessibility

- `@gsap/react` `useGSAP` scopes every tween and ScrollTrigger to the component.
  `revertOnUpdate` and `gsap.matchMedia()` cleanly tear down and rebuild the
  sequence when motion state or the desktop breakpoint changes; unmounting
  reverts the context.
- At compact widths and under `prefers-reduced-motion`, the sticky choreography
  is not initialized. All four articles remain in normal reading order.
- Pause motion removes the enhanced sticky state and reveals the linear version
  without locking document scroll.
- The sequence includes a keyboard-reachable skip link, named scene navigation,
  focusable narrative panels, pressed states, real buttons, and source links.
- The globe's click path now converts the pointer position through
  `toGlobeCoords`, with a six-pixel movement threshold so clicks are deterministic
  while drags remain camera gestures.

## Scientific captions

The sensor-history caption uses NASA ARSET's fire-detection instrument table:
MODIS platforms Terra (1999) and Aqua (2002); VIIRS platforms Suomi NPP (2011)
and NOAA-20 (2017), with different spatial sampling. The interface does not turn
those facts into a numerical calibration claim. Source:
https://disasters.nasa.gov/sites/default/files/2023-03/D1P5_FireDetection_Final.pdf

Every period readout remains labeled `Raw mixed fleet · not harmonized`. The
January 2020 and August 2025 totals come from the Phase 01 checked aggregate and
are presented as distinct snapshots, not a long-term trend.

## Visual and browser evidence

Inspected captures:

- `artifacts/screenshots/phase04-scene-1-1440x900.png`
- `artifacts/screenshots/phase04-scene-2-1440x900.png`
- `artifacts/screenshots/phase04-scene-4-1440x900.png`
- `artifacts/screenshots/phase04-documentary-390x844.png`
- `artifacts/traces/phase04-documentary-playwright.zip`

The first implementation temporarily placed all story panels inside the live
hero and broke the compact composition. It was removed before the checkpoint.
The final structure keeps the Phase 03 hero untouched and moves the documentary
below it. A second visual pass removed a leaking skip link and footer overlap.

The sequence is understandable without voiceover: every scene has a declarative
heading, one explanatory paragraph, visible metric/source context, and explicit
navigation state. The three desktop captures preserve a consistent stage while
the headline, data month, clusters, and framing advance.

Final verification:

- `npm run check`: PASS — lint, typecheck, 4 unit tests, production build.
- `npx playwright test --trace on`: PASS — 9/9 Edge tests in 1.8 minutes.
- Globe click stress check: PASS — 3/3 consecutive runs.
- Console-error assertion: PASS.
- Desktop and 390×844 horizontal-overflow assertions: PASS.
