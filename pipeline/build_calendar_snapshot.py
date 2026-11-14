from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "apps" / "web" / "public" / "data" / "regional-daily-series.json"
OUTPUT = ROOT / "apps" / "web" / "public" / "data" / "regional-calendar-series.json"
ARTIFACT = ROOT / "artifacts" / "data" / "phase07-calendar-build.json"

STREAMS = {
    "MODIS": {"sensor": "MODIS", "stableStartYear": 2003},
    "VIIRS_SNPP": {"sensor": "VIIRS_SNPP", "stableStartYear": 2013},
}


def main() -> None:
    source: dict[str, Any] = json.loads(SOURCE.read_text(encoding="utf-8"))
    grouped: dict[tuple[str, str, str], dict[str, Any]] = defaultdict(
        lambda: {"count": 0, "sourceCount": 0, "duplicateCount": 0}
    )

    for row in source["daily"]:
        if row["quality"] != "sp" or row["sensor"] not in STREAMS:
            continue
        key = (row["region"], row["date"], row["sensor"])
        grouped[key]["count"] += row["count"]
        grouped[key]["sourceCount"] += row["sourceCount"]
        grouped[key]["duplicateCount"] += row["duplicateCount"]

    daily = [
        {
            "region": region,
            "date": date,
            "stream": stream,
            **counts,
        }
        for (region, date, stream), counts in sorted(grouped.items())
    ]
    generated_at = datetime.now(timezone.utc).isoformat()
    payload = {
        "schemaVersion": 1,
        "pipelineVersion": "phase07-v1",
        "generatedAtUtc": generated_at,
        "sourceGeneratedAtUtc": source["generatedAtUtc"],
        "period": source["period"],
        "metricKind": "raw_sensor_count",
        "unit": source["unit"],
        "regions": source["regions"],
        "streams": STREAMS,
        "source": {
            "producer": source["source"]["producer"],
            "mirror": source["source"]["mirror"],
            "pathPattern": source["source"]["pathPattern"],
            "snapshots": source["source"]["snapshots"],
            "unavailableYears": source["source"]["unavailableYears"],
        },
        "processing": {
            "quality": "sp",
            "aggregation": "sum named stream rows across platforms and day/night for each UTC date",
            "missingDays": "not emitted; missing is unavailable and is never filled with zero",
            "referenceRule": "client computes same-calendar-month distributions from stable prior years only",
            "sourceRows": source["processing"]["sourceRows"],
            "exactDuplicateRowsRemoved": source["processing"]["exactDuplicateRowsRemoved"],
        },
        "caveat": source["caveat"],
        "daily": daily,
    }
    OUTPUT.write_text(json.dumps(payload, separators=(",", ":")) + "\n", encoding="utf-8")
    ARTIFACT.parent.mkdir(parents=True, exist_ok=True)
    artifact = {
        "command": "python pipeline/build_calendar_snapshot.py",
        "source": str(SOURCE.relative_to(ROOT)),
        "output": str(OUTPUT.relative_to(ROOT)),
        "dailyRows": len(daily),
        "outputBytes": OUTPUT.stat().st_size,
        "streams": sorted(STREAMS),
        "regions": sorted(source["regions"]),
        "completedAtUtc": generated_at,
    }
    ARTIFACT.write_text(json.dumps(artifact, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(artifact, indent=2))


if __name__ == "__main__":
    main()
