from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "apps" / "web" / "public" / "data" / "global-preview.json"


def fail(message: str) -> None:
    raise SystemExit(f"validation failed: {message}")


def main() -> None:
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    periods = payload.get("periods", [])
    if len(periods) < 2:
        fail("at least two periods are required")
    if "not harmonized" not in payload.get("warning", "").lower():
        fail("mixed-sensor warning is missing")

    signatures = []
    for period in periods:
        cells = period.get("cells", [])
        if not cells:
            fail(f"{period.get('period')} has no cells")
        if period.get("metricKind") != "raw_sensor_count":
            fail(f"{period.get('period')} has an invalid metric kind")
        if period.get("globalTotal", 0) <= 0:
            fail(f"{period.get('period')} global total is not positive")
        if sum(cell["count"] for cell in cells) != period.get("cellsTotal"):
            fail(f"{period.get('period')} displayed-cell total does not reconcile")
        if period["cellsTotal"] > period["globalTotal"]:
            fail(f"{period.get('period')} displayed total exceeds global total")
        if not all(
            isinstance(cell.get("count"), int)
            and isinstance(cell.get("lat"), (int, float))
            and isinstance(cell.get("lng"), (int, float))
            for cell in cells
        ):
            fail(f"{period.get('period')} contains malformed cells")
        signatures.append(
            (
                period["globalTotal"],
                tuple((cell["id"], cell["count"]) for cell in cells[:25]),
            )
        )

    if len(set(signatures)) != len(signatures):
        fail("periods do not contain distinct values")

    print(
        json.dumps(
            {
                "status": "pass",
                "periods": [period["period"] for period in periods],
                "globalTotals": [period["globalTotal"] for period in periods],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
