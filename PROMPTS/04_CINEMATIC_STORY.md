# PROMPT 04 — Storytelling and camera choreography

Use GSAP + ScrollTrigger (+ @gsap/react lifecycle) to create a purposeful documentary sequence: scene 1 `Every place has a history of burning` → scene 2 Earth's seasonal pulses on globe → scene 3 why MODIS/VIIRS counts differ → scene 4 user selects a region and zooms toward geographic evidence. Choreograph camera and text; no looping flashy animations. Timeline must remain functionally independent of scrolling; scroll-driven state should not fight with user scrubbing. Implement proper teardown/reinit on route change and on responsive resize.

Build real captions tied to documented sensor timelines, source labels, a skip-intro link, pause motion control, keyboard navigation and `prefers-reduced-motion` fallback. Use same stage design across transitions; no generic marketing cards or fake satellite renderings. Include subtle real-data transition between two time periods. Capture 3 browser states and assess whether the narrative can be understood without voiceover.

ACCEPTANCE: no jank/scroll lock; no broken accessibility; animation state doesn't overwrite manual controls; screenshots/traces exist; design holds on mobile; build passes.
