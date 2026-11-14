# Phase 04 cinematic story

## Structure

The documentary sequence is a separate section below the verified Phase 03
hero. This preserves the original hero composition and keeps a single WebGL
engine on the page. The story uses lightweight HTML/CSS evidence plates derived
from the real Phase 01 A5 centroids and a 180-row-per-region subset of the real
Phase 05 FIRMS extraction. It does not create a second Three.js scene or invent
satellite imagery.

On viewports at least 901 pixels wide, GSAP ScrollTrigger holds the documentary
stage while four markers activate:

1. an archive plate explains detections as timestamped pixels, not unique fires;
2. two simultaneous hemispheres compare checked seasonal spatial snapshots;
3. a split instrument plate keeps MODIS numeric and VIIRS categorical confidence
   vocabularies separate;
4. a regional coordinate field plots real rows inside a disclosed bounding box.

Each chapter has a separate visual system rather than reusing one globe. GSAP
crossfades and gently resolves each plate without continuous decoration. The
incoming text and evidence plate share the same 620 ms arrival window and finish
together. A single section-level ScrollTrigger snaps a completed scroll gesture
to the nearest chapter, preventing half-resolved in-between frames. Scene-nav
buttons land directly on the exact chapter coordinate while the same synchronized
transition provides the visible motion. A user's explicit
month choice sets a lock, after which scrolling cannot overwrite that choice.
The Phase 03 hero timeline is entirely outside the story state and remains
independent.

## Lifecycle and accessibility

- `@gsap/react` `useGSAP` scopes every tween and ScrollTrigger to the component.
  `revertOnUpdate` and `gsap.matchMedia()` cleanly tear down and rebuild the
  sequence when motion state or the desktop breakpoint changes; unmounting
  reverts the context.
- At compact widths and under `prefers-reduced-motion`, the sticky choreography
  is not initialized. Each article is paired directly with its own evidence
  plate in normal reading order; the desktop visual is not hoisted above the copy.
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

Every period readout remains labeled as raw mixed-fleet data. The
January 2020 and August 2025 totals come from the Phase 01 checked aggregate and
are presented as distinct snapshots, not a long-term trend.

## Visual and browser evidence

Inspected captures:

- `artifacts/screenshots/phase04-scene-1-1440x900.png`
- `artifacts/screenshots/phase04-scene-2-1440x900.png`
- `artifacts/screenshots/phase04-scene-3-1440x900.png`
- `artifacts/screenshots/phase04-scene-4-1440x900.png`
- `artifacts/screenshots/phase04-documentary-390x844.png`
- `artifacts/screenshots/phase04-sensor-390x844.png`
- `artifacts/screenshots/phase04-region-390x844.png`
- `artifacts/traces/phase04-documentary-playwright.zip`

The first implementation temporarily placed all story panels inside the live
hero and broke the compact composition. It was removed before the checkpoint.
The final structure keeps the Phase 03 hero untouched and moves the documentary
below it. A second visual pass removed a leaking skip link and footer overlap.

After the checkpoint, the user correctly rejected the first scene treatment as
under-designed. The original reused a single projected globe while only swapping
copy and scale. It was rebuilt rather than cosmetically adjusted. The four final
plates now make archive, season, sensor semantics, and place visibly distinct.
The sequence is understandable without voiceover: every scene has a declarative
heading, one explanatory paragraph, visible metric/source context, and explicit
navigation state.

Final verification:

- `npm run check`: PASS — lint, typecheck, 4 unit tests, production build.
- `npx playwright test`: PASS — 9/9 Edge tests after the redesign.
- Transition-specific browser assertions wait for both the active text panel and
  active evidence plate to reach opacity 1 before capture.
- Globe click stress check: PASS — 3/3 consecutive runs.
- Console-error assertion: PASS.
- Desktop and 390×844 horizontal-overflow assertions: PASS.
