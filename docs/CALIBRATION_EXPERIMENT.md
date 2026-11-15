# EMBER calibration experiment — `ember-overlap-ratio-v1`

## Decision

**Unvalidated. Keep MODIS and VIIRS sensor histories separate.**

The fit improved several held-out metrics, but only two independent AOIs were
available. That fails the predeclared geographic-breadth gate. The experiment
also worsened MAE in 2020. It does not activate or justify a unified index.

## Reproduce

From the repository root, after Phase 06 data exists:

```powershell
pipeline/.venv/Scripts/python.exe pipeline/run_calibration_experiment.py
```

Inputs and outputs:

- source: `apps/web/public/data/regional-monthly-series.json`;
- report: `artifacts/data/phase08-calibration-experiment.json`;
- public report: `apps/web/public/data/calibration-experiment.json`;
- plots: `artifacts/plots/phase08-validation-series.svg` and
  `artifacts/plots/phase08-year-mae.svg`.

No calibration dependency is added; the experiment uses Python standard-library
statistics and deterministic SVG generation.

## Question and target

The exercise asks whether VIIRS Suomi-NPP SP monthly detected-pixel counts can
be aligned to the MODIS Terra+Aqua SP monthly detected-pixel count in the same
region/month. MODIS is a reference stream here, **not physical fire ground
truth**. Months must contain positive rows in both streams; missing months are
excluded and never filled with zero.

## Split and models

- Training: 2013–2018, 144 region-month pairs.
- Chronological hold-out: 2019–2024, 144 region-month pairs.
- Unadjusted comparator: VIIRS count used directly.
- Baseline: one median MODIS/VIIRS ratio from all training pairs.
- Experiment: median MODIS/VIIRS ratio per region and calendar month, estimated
  only from training pairs. Each factor has six training samples.

This controls the most obvious region and seasonal differences while remaining
auditable. It does not control cloud/smoke, exact overpass timing, usable
observation area, land-cover change, or event identity.

## Held-out results

| Model | MAE | RMSE | Median APE | sMAPE | R² vs MODIS |
| --- | ---: | ---: | ---: | ---: | ---: |
| Unadjusted VIIRS | 6,285.097 | 14,428.784 | 369.444% | 128.844% | -15.2197 |
| Global ratio baseline | 330.191 | 642.903 | 22.001% | 27.420% | 0.9678 |
| Region/season experiment | 238.720 | 518.695 | 14.059% | 19.959% | 0.9790 |

Experimental MAE improved 27.702% overall. Punjab improved 39.207%; California
improved 1.994%. Five of six held-out years improved. 2020 regressed from
340.560 baseline MAE to 390.160 experimental MAE.

High R² is not evidence of fire truth: both sensors respond to the same strong
seasonality and large events, and the comparison target is another sensor.

## Predeclared gates

| Gate | Result |
| --- | --- |
| ≥10% overall MAE improvement | Pass |
| No held-out region worsens | Pass |
| At least 4/6 held-out years improve | Pass (5/6) |
| At least 60 hold-out months per region | Pass (72 each) |
| At least 3 independent held-out regions | **Fail (2)** |

Because every gate is required, the status is `unvalidated` and the decision is
`keep_sensor_series_separate`. A typed application guard and unit tests prevent
this report from being presented as `validated_harmonized_index`.

## Uncertainty and failure cases

No confidence interval is reported. Two AOIs and positive-only overlap are too
narrow for defensible general uncertainty bounds. Large held-out errors include
Punjab 2020-04, California 2024-02, and Punjab 2023-05. Sensor sensitivity,
overpass timing, cloud/smoke, fleet changes, and land management can all affect
the ratio. This model must not be used for forecasting, emergency severity,
burned area, cause, climate attribution, or an all-region fire trend.
