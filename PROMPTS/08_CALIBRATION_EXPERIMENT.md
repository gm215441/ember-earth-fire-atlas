# PROMPT 08 — Harmonization research, with rigorous honesty

Implement an experiment, not a guaranteed 'AI breakthrough'. Construct comparable region/month sensor-series from source-quality observations where actual overlap exists; control for platform and time as feasible. Start with simple interpretable baseline (single MODIS-reference series and VIIRS separate), try a carefully documented overlap-fit calibration, split training and validation chronologically, and compare with unadjusted or constant-ratio baselines. No ground-truth claim from VIIRS alone. Report sample sizes, per-region/year metrics, uncertainty if defensible, and cases of failure.

If calibration cannot be shown to be stable/improved in held-out periods, **DO NOT ship a unified index as scientifically validated**. Keep comparison separate, label experimental results, and explain limitation. If it does pass, implement a clearly labelled validated index with method/version/bounds and a toggle to inspect source streams. No invented confidence intervals or fake 98%-accuracy claims.

ACCEPTANCE: executed training/hold-out notebook or script, documented metrics and plots from actual data, versioned method, tests proving unvalidated models cannot appear as validated. Graceful fallback to separate sensor series is an acceptable scientifically sound completion.
