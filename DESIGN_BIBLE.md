# EMBER — cinematic design bible (source of truth when Figma isn't supplied)

## Creative direction
An interactive **Earth-science documentary**, not SaaS analytics or a copy of NASA FIRMS. The feeling: a quiet observatory after dark, immense planetary scale, scientific precision, and restraint. Think editorial title treatment, real geographic information, elegant data visualization and a coherent continuous journey. No generic glassmorphism card grids on landing, no random animated lines or fictional particle fire, no template admin sidebars.

## Fixed design tokens
- Background `#050911` deep-blue near black; raised `#0C1420`; panel `#101B29`; text `#F2F3F0`; secondary `#A8B4C0`; subtle `#6D7C8D`; borders `rgba(204,218,229,0.14)`.
- Meaningful accent ember `#E97443`; bright emphasis `#F4A36E`; low/quiet `#36505A`; missing/unobserved `#637080`; neutral clear observation `#457563` **only when observation data supports it**.
- Red, orange and purple scientific palettes must be perceptually ordered, color-blind conscious, with a text legend and other encodings. Never imply red = active emergency by color alone.
- Typography: editorial headings via `next/font/google` (try `Space_Grotesk`, fallback local/system), functional content `Inter`, telemetry labels `IBM_Plex_Mono`; verify exact import IDs at build time. Large title desktop ~clamp(3.5rem,7vw,7.5rem), but max line length 11–13 chars in hero; body 16–18px; scientific labels 11–13px.
- Radii restrained: input/chip 8–12px, detail surface 16px, none for the cinematic hero frame. No thick glowing neon borders.
- Content width 1440 max; desktop 24/32/48px gutters; mobile 16/20px.

## Scene 0: Opening 3D planet (route `/`)
**Desktop frame 1440×900:** pitch-black starless or subtle star environment; top nav minimal logo left `EMBER / EARTH FIRE ATLAS`, right `EXPLORE`, `METHODOLOGY`; center-left editorial text 38–42% width, globe occupies 60–70% on right with radius large enough to extend beyond right edge. Anchored below: compact timeline ribbon and narrative line, not generic cards. Tiny provenance footer, no fake counters. A dramatic earth silhouette with NASA-derived Blue Marble texture, subtle atmosphere; actual fire activity as luminous but restrained aggregate cells. Empty globe states must look intentional.
**Hero copy:** eyebrow `TWENTY-FIVE YEARS OF EARTH'S FIRE RECORD`; headline `Every place has a history of burning.`; subhead `Explore the seasons, signals, and uncertainty in satellite-detected activity.`; CTA `Explore the atlas`; secondary `How two satellites see fire differently`.
**Interactions:** pointer drag rotates, wheel/pinch zoom bounded, stop auto-rotation while interacting, keyboard-accessible region search alternative, source legend, `Play year` button; a click focuses region and changes URL. Animation is time-controlled; no explosive fire particle animation.
**Camera movement:** start oblique earth view; on CTA settle then move to regional map via coordinated GSAP transition and route change. If WebGL unsupported/reduced motion, show a real-data static map + accessible region selector; do not block navigation.

## Scene 1: Discover (on landing when scrolling)
Full-width editorial timeline band under hero. A dense but readable narrow-horizon graph of monthly raw *satellite detections* (label as raw). Years visibly track satellite additions with explanatory markers; clicking a month changes globe grid; no 25-year autoplay by default. The years `2000`, `2012`, `2018`, `2024`, and now are marked as sensor history. Explain how more sensitive sensors change counts (without invented dramatic percentages). Show a compelling side-by-side `two satellites / different sight` visual based on verified information, not pixel claims from unavailable data.

## Scene 2: Regional explorer (`/explore`)
Desktop: Left 65% precise MapLibre map with deck.gl data layer; right 35% sticky instrument-style control panel, charcoal and hairline dividers, not giant rounded cards. Top location bar + date range. Panel order: selected AOI and quality; month histogram; `Detected pixels` vs `Reference season`; legend; detection source drawer. Bottom timeline across width. On mobile map first at 50vh then accordions, calendar below; no horizontal overflow.
Controls: region search/select (with curated Punjab, California); source sensor and satellite; SP vs NRT; day/night; date range; hover/click detection with UTC/time/source/FRP/confidence instrument-specific. If data for selected area isn't available, clear truthful message with alternate region, not demo fake data.

## Scene 3: The calendar (`/calendar`)
Full-width typography title `The season beneath the season.` Large 12-month ribbon showing an activity profile for selected region; daily calendar grid below if the dataset supports it; tabs per sensor and a reference-anchored index. Show observation/analysis caveats in compact rail. Hover shows detected fire pixels, data source, optional anomaly benchmark, and missing-data flags. Visually distinct typography for science metrics vs narrative. Do not smooth daily missing observations into a fabricated daily signal.

## Scene 4: Sensor comparison (`/compare`)
A scientifically honest side-by-side of MODIS versus VIIRS, default raw lines in **separate panels** with different scales; optional validated calibration explicitly marked with confidence/held-out metrics. Scientific explanation takes priority over decoration. An 'explain' strip with short interactive progression: `MODIS watches` → `VIIRS watches` → `why these counts diverge` → `what can be compared`.

## Scene 5: Fire Season Passport (`/passport`)
Print-first, high-quality scientific editorial sheet (A4/Letter). Off-white paper theme distinct from dark UI. Top: EMBER logo, region name, date, coordinates/AOI, source dataset/snapshot. Middle: historic season profile mini-graph, peak months with caveat, a defensible observation/trend statement, source legend. Bottom: methodology shortlink and limitations. Printable via browser `window.print()`; styles must not clip. No fake findings.

## Animation constraints
GSAP ScrollTrigger controls orchestrated scene visibility/camera; animations last approximately 300–900ms for interface and up to ~1800ms for cinematic focus; tune by browser observation, not rigid time targets. Keep motion purposeful: rotate, zoom, fade, reveal. Do not continually animate every panel. Ensure under 55ms long tasks where feasible and target fluid interactions on mid-range laptop. On `prefers-reduced-motion: reduce` remove parallax/transitional camera movement and support static navigation.

## QA scorecard
Score out of 5 each: (1) recognizable cinematic identity, (2) planetary scale, (3) legible data, (4) responsive mobile, (5) effortless navigation, (6) smooth motion, (7) accurate legends/provenance, (8) polished empty/loading/error states. Each <4 means fix before adding optional features. Required screenshots: hero initial, hero at changed month, explore region, compare, calendar, passport, mobile home and mobile explore.
