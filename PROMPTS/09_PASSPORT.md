# PROMPT 09 — Distinctive Fire Season Passport and user journey

Design and implement `/passport` printable region sheet. It must look like an excellent science magazine spread: big title, concise evidence-driven regional insight, 12-month seasonal signature, source badges, clear data-coverage and sensor caution, a date range, location extent, snapshot date, and QR/link back to the specific web analysis if feasible. No generic résumé/PDF template. Print A4 and US Letter without cut-offs; browser print-to-PDF is enough initially. Make `Generate Passport` the satisfying endpoint of the home → select region → explore → calendar journey. Shareable URL must preserve AOI/selection without leaking secrets.

Use source-derived data and only explain results that are computed. Include any validation limitations and a real methods/source link. Capture browser print preview or PDF via Playwright; test download/print interaction, page breaks, mobile print button.

ACCEPTANCE: a generated passport for one real region has a meaningful, checkable historical fact and valid citations; print page looks polished and isn't clipped; navigation and state preservation pass.
