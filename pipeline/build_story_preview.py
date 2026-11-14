from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "apps" / "web" / "public" / "data" / "regional-2025.json"
OUTPUT = ROOT / "apps" / "web" / "public" / "data" / "story-regions.json"
POINTS_PER_REGION = 180


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    regions = {}
    for slug, region in source["regions"].items():
        observations = region["observations"]
        step = max(1, len(observations) // POINTS_PER_REGION)
        selected = observations[::step][:POINTS_PER_REGION]
        regions[slug] = {
            "label": region["label"],
            "bounds": region["bounds"],
            "fullObservationCount": region["fullObservationCount"],
            "points": [
                {
                    "latitude": row["latitude"],
                    "longitude": row["longitude"],
                    "acquiredUtc": row["acquiredUtc"],
                    "sensor": row["sensor"],
                }
                for row in selected
            ],
        }

    payload = {
        "schemaVersion": 1,
        "period": source["period"],
        "metricKind": source["metricKind"],
        "provenance": source["provenance"],
        "sampling": {
            "method": "evenly spaced subset of the Phase 05 deterministic display sample",
            "pointsPerRegion": POINTS_PER_REGION,
            "note": "Story points are real rows; full regional totals remain separate.",
        },
        "regions": regions,
    }
    OUTPUT.write_text(
        json.dumps(payload, separators=(",", ":"), ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"{OUTPUT.relative_to(ROOT)}: {OUTPUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
