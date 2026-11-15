from __future__ import annotations

import json
import math
import statistics
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "apps" / "web" / "public" / "data" / "regional-monthly-series.json"
ARTIFACT = ROOT / "artifacts" / "data" / "phase08-calibration-experiment.json"
PUBLIC = ROOT / "apps" / "web" / "public" / "data" / "calibration-experiment.json"
SERIES_PLOT = ROOT / "artifacts" / "plots" / "phase08-validation-series.svg"
YEAR_PLOT = ROOT / "artifacts" / "plots" / "phase08-year-mae.svg"
PUBLIC_SERIES_PLOT = ROOT / "apps" / "web" / "public" / "data" / "calibration-validation-series.svg"
PUBLIC_YEAR_PLOT = ROOT / "apps" / "web" / "public" / "data" / "calibration-year-mae.svg"
TRAIN_START, TRAIN_END = 2013, 2018
VALIDATION_START, VALIDATION_END = 2019, 2024
METHOD_ID = "ember-overlap-ratio-v1"


def aggregate_overlap(dataset: dict[str, Any]) -> list[dict[str, Any]]:
    values: dict[tuple[str, str, str], int] = defaultdict(int)
    for row in dataset["monthly"]:
        if row["quality"] != "sp" or row["sensor"] not in {"MODIS", "VIIRS_SNPP"}:
            continue
        values[(row["region"], row["month"], row["sensor"])] += row["count"]
    pairs = []
    keys = {(region, month) for region, month, _ in values}
    for region, month in sorted(keys):
        modis = values.get((region, month, "MODIS"))
        viirs = values.get((region, month, "VIIRS_SNPP"))
        if modis is None or viirs is None or viirs <= 0:
            continue
        pairs.append({
            "region": region,
            "month": month,
            "year": int(month[:4]),
            "calendarMonth": int(month[5:7]),
            "modis": modis,
            "viirs": viirs,
        })
    return pairs


def metrics(rows: list[dict[str, Any]], prediction_key: str) -> dict[str, float]:
    actual = [row["modis"] for row in rows]
    predicted = [row[prediction_key] for row in rows]
    errors = [prediction - truth for prediction, truth in zip(predicted, actual)]
    absolute = [abs(error) for error in errors]
    ape = [abs(error) / truth * 100 for error, truth in zip(errors, actual) if truth > 0]
    smape = [abs(error) / ((abs(prediction) + abs(truth)) / 2) * 100 for error, prediction, truth in zip(errors, predicted, actual) if prediction or truth]
    mean_actual = statistics.fmean(actual)
    denominator = sum((truth - mean_actual) ** 2 for truth in actual)
    r2 = 1 - sum(error ** 2 for error in errors) / denominator if denominator else 0.0
    return {
        "n": len(rows),
        "mae": round(statistics.fmean(absolute), 3),
        "rmse": round(math.sqrt(statistics.fmean(error ** 2 for error in errors)), 3),
        "medianApePct": round(statistics.median(ape), 3),
        "smapePct": round(statistics.fmean(smape), 3),
        "r2AgainstModis": round(r2, 4),
    }


def line_path(values: list[float], x0: float, y0: float, width: float, height: float, maximum: float) -> str:
    return " ".join(
        f"{'M' if index == 0 else 'L'}{x0 + index / max(1, len(values) - 1) * width:.2f},{y0 + height - value / maximum * height:.2f}"
        for index, value in enumerate(values)
    )


def write_series_plot(validation: list[dict[str, Any]]) -> None:
    width, height = 1280, 720
    panels = []
    for panel_index, region in enumerate(["punjab", "california"]):
        rows = [row for row in validation if row["region"] == region]
        maximum = max(max(row["modis"], row["constantRatioPrediction"], row["experimentalPrediction"]) for row in rows)
        x0, y0, chart_width, chart_height = 105, 130 + panel_index * 285, 1080, 205
        actual = line_path([row["modis"] for row in rows], x0, y0, chart_width, chart_height, maximum)
        baseline = line_path([row["constantRatioPrediction"] for row in rows], x0, y0, chart_width, chart_height, maximum)
        experiment = line_path([row["experimentalPrediction"] for row in rows], x0, y0, chart_width, chart_height, maximum)
        panels.append(f'''
        <text x="105" y="{y0 - 28}" class="panel">{region.upper()} · VALIDATION 2019–2024</text>
        <line x1="{x0}" x2="{x0 + chart_width}" y1="{y0 + chart_height}" y2="{y0 + chart_height}" class="grid" />
        <line x1="{x0}" x2="{x0 + chart_width}" y1="{y0 + chart_height / 2}" y2="{y0 + chart_height / 2}" class="grid" />
        <path d="{actual}" class="actual" /><path d="{baseline}" class="baseline" /><path d="{experiment}" class="experiment" />
        <text x="{x0 - 12}" y="{y0 + 4}" text-anchor="end" class="axis">{maximum:,.0f}</text>
        <text x="{x0}" y="{y0 + chart_height + 24}" class="axis">2019-01</text><text x="{x0 + chart_width}" y="{y0 + chart_height + 24}" text-anchor="end" class="axis">2024-12</text>''')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
    <rect width="100%" height="100%" fill="#050911" />
    <style>.title{{font:500 34px Arial;fill:#f2f3f0}}.sub{{font:12px monospace;fill:#a8b4c0}}.panel{{font:11px monospace;letter-spacing:2px;fill:#e97443}}.axis{{font:9px monospace;fill:#6d7c8d}}.grid{{stroke:#a8b4c0;stroke-opacity:.12}}path{{fill:none;stroke-width:2}}.actual{{stroke:#f2f3f0}}.baseline{{stroke:#6d7c8d;stroke-dasharray:5 5}}.experiment{{stroke:#e97443}}</style>
    <text x="64" y="58" class="title">Held-out monthly alignment — not fire truth</text>
    <text x="64" y="86" class="sub">ACTUAL MODIS (WHITE) · GLOBAL RATIO BASELINE (DASHED) · REGION/SEASON FIT (EMBER)</text>
    {''.join(panels)}
    <text x="64" y="690" class="sub">SP overlap months only · independent positive-detection streams · chronological hold-out</text></svg>'''
    SERIES_PLOT.parent.mkdir(parents=True, exist_ok=True)
    SERIES_PLOT.write_text(svg, encoding="utf-8")
    PUBLIC_SERIES_PLOT.write_text(svg, encoding="utf-8")


def write_year_plot(yearly: list[dict[str, Any]]) -> None:
    width, height = 1280, 620
    maximum = max(max(row["constantRatio"]["mae"], row["experimental"]["mae"]) for row in yearly)
    groups = []
    for index, row in enumerate(yearly):
        x = 105 + index * 185
        baseline_height = row["constantRatio"]["mae"] / maximum * 380
        experiment_height = row["experimental"]["mae"] / maximum * 380
        groups.append(f'''<rect x="{x}" y="{500 - baseline_height:.2f}" width="46" height="{baseline_height:.2f}" class="baseline" /><rect x="{x + 54}" y="{500 - experiment_height:.2f}" width="46" height="{experiment_height:.2f}" class="experiment" /><text x="{x + 50}" y="528" text-anchor="middle" class="axis">{row['year']}</text>''')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><rect width="100%" height="100%" fill="#050911" /><style>.title{{font:500 34px Arial;fill:#f2f3f0}}.sub{{font:12px monospace;fill:#a8b4c0}}.axis{{font:10px monospace;fill:#6d7c8d}}.baseline{{fill:#6d7c8d}}.experiment{{fill:#e97443}}</style><text x="64" y="58" class="title">Held-out MAE by year</text><text x="64" y="86" class="sub">GLOBAL CONSTANT-RATIO BASELINE (GRAY) · REGION/SEASON FIT (EMBER)</text><line x1="82" x2="1190" y1="500" y2="500" stroke="#a8b4c0" stroke-opacity=".2" />{''.join(groups)}<text x="64" y="585" class="sub">Lower is better · target is MODIS-reference monthly count, not physical ground truth</text></svg>'''
    YEAR_PLOT.write_text(svg, encoding="utf-8")
    PUBLIC_YEAR_PLOT.write_text(svg, encoding="utf-8")


def main() -> None:
    dataset = json.loads(SOURCE.read_text(encoding="utf-8"))
    pairs = aggregate_overlap(dataset)
    training = [row for row in pairs if TRAIN_START <= row["year"] <= TRAIN_END]
    validation = [row.copy() for row in pairs if VALIDATION_START <= row["year"] <= VALIDATION_END]
    global_ratio = statistics.median(row["modis"] / row["viirs"] for row in training)
    seasonal_ratios: dict[tuple[str, int], float] = {}
    for region in dataset["regions"]:
        for month in range(1, 13):
            samples = [row["modis"] / row["viirs"] for row in training if row["region"] == region and row["calendarMonth"] == month]
            if samples:
                seasonal_ratios[(region, month)] = statistics.median(samples)

    for row in validation:
        row["unadjustedPrediction"] = row["viirs"]
        row["constantRatioPrediction"] = row["viirs"] * global_ratio
        row["experimentalPrediction"] = row["viirs"] * seasonal_ratios[(row["region"], row["calendarMonth"])]

    overall = {name: metrics(validation, key) for name, key in {
        "unadjusted": "unadjustedPrediction",
        "constantRatio": "constantRatioPrediction",
        "experimental": "experimentalPrediction",
    }.items()}
    by_region = {}
    for region in dataset["regions"]:
        rows = [row for row in validation if row["region"] == region]
        by_region[region] = {
            "unadjusted": metrics(rows, "unadjustedPrediction"),
            "constantRatio": metrics(rows, "constantRatioPrediction"),
            "experimental": metrics(rows, "experimentalPrediction"),
        }
    by_year = []
    for year in range(VALIDATION_START, VALIDATION_END + 1):
        rows = [row for row in validation if row["year"] == year]
        by_year.append({
            "year": year,
            "unadjusted": metrics(rows, "unadjustedPrediction"),
            "constantRatio": metrics(rows, "constantRatioPrediction"),
            "experimental": metrics(rows, "experimentalPrediction"),
        })

    overall_improvement = (overall["constantRatio"]["mae"] - overall["experimental"]["mae"]) / overall["constantRatio"]["mae"] * 100
    region_improvements = {
        region: (values["constantRatio"]["mae"] - values["experimental"]["mae"]) / values["constantRatio"]["mae"] * 100
        for region, values in by_region.items()
    }
    years_improved = sum(row["experimental"]["mae"] < row["constantRatio"]["mae"] for row in by_year)
    gates = [
        {"id": "overall_mae", "requirement": "experimental MAE improves constant-ratio baseline by at least 10%", "passed": overall_improvement >= 10, "value": round(overall_improvement, 3)},
        {"id": "regional_stability", "requirement": "experimental MAE does not worsen in either held-out region", "passed": all(value >= 0 for value in region_improvements.values()), "value": {key: round(value, 3) for key, value in region_improvements.items()}},
        {"id": "year_stability", "requirement": "experimental MAE improves in at least 4 of 6 held-out years", "passed": years_improved >= 4, "value": years_improved},
        {"id": "sample_size", "requirement": "at least 60 held-out overlap months per region", "passed": all(values["experimental"]["n"] >= 60 for values in by_region.values()), "value": {key: values["experimental"]["n"] for key, values in by_region.items()}},
        {"id": "geographic_breadth", "requirement": "at least 3 independent held-out regions before general validation", "passed": len(by_region) >= 3, "value": len(by_region)},
    ]
    status = "validated" if all(gate["passed"] for gate in gates) else "unvalidated"
    worst = sorted(validation, key=lambda row: abs(row["experimentalPrediction"] - row["modis"]) / row["modis"], reverse=True)[:8]
    generated_at = datetime.now(timezone.utc).isoformat()
    report = {
        "schemaVersion": 1,
        "methodId": METHOD_ID,
        "status": status,
        "decision": "publish_validated_index" if status == "validated" else "keep_sensor_series_separate",
        "generatedAtUtc": generated_at,
        "source": str(SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "target": "MODIS Terra+Aqua SP monthly detected-pixel count; a reference stream, not ground truth",
        "predictor": "VIIRS Suomi-NPP SP monthly detected-pixel count",
        "overlapRule": "months with positive rows in both named streams; missing months excluded, never filled with zero",
        "split": {"training": [TRAIN_START, TRAIN_END], "validation": [VALIDATION_START, VALIDATION_END], "kind": "chronological"},
        "trainingSampleCount": len(training),
        "validationSampleCount": len(validation),
        "model": {
            "baseline": "single global median MODIS/VIIRS ratio estimated on training months",
            "experimental": "median MODIS/VIIRS ratio per region and calendar month estimated on training months",
            "globalRatio": round(global_ratio, 8),
            "seasonalFactors": [
                {"region": region, "calendarMonth": month, "factor": round(factor, 8), "trainingN": sum(row["region"] == region and row["calendarMonth"] == month for row in training)}
                for (region, month), factor in sorted(seasonal_ratios.items())
            ],
        },
        "metrics": {"overall": overall, "byRegion": by_region, "byYear": by_year},
        "gates": gates,
        "worstHeldOutCases": [{key: round(value, 3) if isinstance(value, float) else value for key, value in row.items()} for row in worst],
        "uncertainty": "No confidence interval is claimed; two AOIs and positive-only overlap are too narrow for general uncertainty bounds.",
        "caveat": "Alignment to MODIS is not physical fire ground truth. Sensor sensitivity, overpass timing, cloud/smoke and fleet changes remain. A failed gate forbids a validated unified index.",
        "validationRows": [{key: round(value, 3) if isinstance(value, float) else value for key, value in row.items()} for row in validation],
        "plots": [str(SERIES_PLOT.relative_to(ROOT)).replace("\\", "/"), str(YEAR_PLOT.relative_to(ROOT)).replace("\\", "/")],
    }
    ARTIFACT.parent.mkdir(parents=True, exist_ok=True)
    ARTIFACT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    PUBLIC.write_text(json.dumps(report, separators=(",", ":")) + "\n", encoding="utf-8")
    write_series_plot(validation)
    write_year_plot(by_year)
    print(json.dumps({
        "methodId": METHOD_ID,
        "status": status,
        "trainingSampleCount": len(training),
        "validationSampleCount": len(validation),
        "overallMaeImprovementPct": round(overall_improvement, 3),
        "regionMaeImprovementPct": {key: round(value, 3) for key, value in region_improvements.items()},
        "yearsImproved": years_improved,
        "failedGates": [gate["id"] for gate in gates if not gate["passed"]],
    }, indent=2))


if __name__ == "__main__":
    main()
