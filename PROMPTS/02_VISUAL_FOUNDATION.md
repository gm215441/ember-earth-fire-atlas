# PROMPT 02 — Distinctive design system + first cinematic frame

Read DESIGN_BIBLE.md line by line. Build a high-fidelity, visually sophisticated opening view, **not** an ordinary dashboard. Create CSS tokens, typography using next/font, responsive grid, navigation, meaningful loading and error states, preview placeholders only where not masquerading as science. Implement full hero layout with graphic stage, title lockup, small source indicator, a year/month control shell, and keyboard-accessible region chooser. The hero is judged as 1440x900 actual screenshot: 60–70% real globe stage on right, 35–40% editorial narrative on left, restrained negative space, no random status cards.

Use the data JSON from phase 01. Do not add a fake globe if data available. Set up Playwright MCP/CLI screenshot at 1440×900 and 390×844. Compare screenshots against proportions/tokens in DESIGN_BIBLE; improve at least two iterations. Produce `docs/VISUAL_REVIEW.md` with frank assessment and screenshots.

ACCEPTANCE: both viewport screenshots exist, correct hierarchy, no generic tile-grid template, no overlap or horizontal scroll, nav accessible, source labels present, build and lint pass. Do not move forward with a broken hero.
