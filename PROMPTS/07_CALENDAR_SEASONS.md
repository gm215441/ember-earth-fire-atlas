# PROMPT 07 — Burning calendar that actually works

Implement `/calendar` that shares AOI/year/sensor state with explore and compare (URL parameters or typed store with synchronization). Use computed per-sensor daily/monthly real activity, source metadata, proper date/UTC labels. Build an intuitive month ribbon and drill-down day calendar. Compute a seasonal historical reference from **other** years of a stable sensor stream, including count dispersion where calculable. Anomaly scoring must be transparently defined, avoid future leakage, and not claim forecast or fire emergency. If data insufficient, show 'not enough comparable history'.

Make the interface personal: region-specific explanatory narrative assembled from computed facts, never a hallucinated LLM conclusion. Highlight peak historical periods with clear source, sample count, caveats and evidence drill-down. Coordinate map and calendar selection with smooth transitions and an obvious back route.

ACCEPTANCE: date selection changes chart and map; score recalculates without current year in baseline; statistics are reproducible in a unit test; missing data not silently zero; mobile interaction verified.
