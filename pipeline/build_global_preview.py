from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from source import (
    bucket_columns,
    connect,
    head_metadata,
    schema,
    write_json,
    year_r5,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "apps" / "web" / "public" / "data" / "global-preview.json"
PERIODS = ("2020-01", "2025-08")
CELL_LIMIT = 1200


def build_period(connection, period: str) -> dict:
    year, month = (int(part) for part in period.split("-"))
    url = year_r5(year)
    table_schema = schema(connection, url)
    month_prefix = f"count_{year}{month:02d}"
    columns = bucket_columns(table_schema, month_prefix)
    if not columns:
        raise RuntimeError(f"No daily aggregate columns found for {period}")

    expression = " + ".join(f"coalesce(\"{column}\", 0)" for column in columns)
    total = connection.execute(
        f"SELECT sum({expression})::BIGINT FROM read_parquet('{url}')"
    ).fetchone()[0]
    rows = connection.execute(
        f"""
        SELECT
          a5_cell,
          round(ST_Y(ST_Centroid(geometry)), 5) AS latitude,
          round(ST_X(ST_Centroid(geometry)), 5) AS longitude,
          ({expression})::BIGINT AS count
        FROM read_parquet('{url}')
        WHERE ({expression}) > 0
        ORDER BY count DESC, a5_cell
        LIMIT {CELL_LIMIT}
        """
    ).fetchall()
    cells = [
        {"id": row[0], "lat": row[1], "lng": row[2], "count": row[3]}
        for row in rows
    ]
    return {
        "period": period,
        "metricKind": "raw_sensor_count",
        "unit": "satellite-detected thermal-anomaly pixels",
        "quality": "mixed SP/NRT only if present in source aggregate; not separable by month",
        "sensorScope": "mixed fleet; aggregate has no month-by-sensor cross-tab",
        "globalTotal": total,
        "cellsTotal": sum(cell["count"] for cell in cells),
        "displayedCellLimit": CELL_LIMIT,
        "source": head_metadata(url),
        "bucketColumns": columns,
        "cells": cells,
    }


def main() -> None:
    connection = connect()
    try:
        periods = [build_period(connection, period) for period in PERIODS]
        payload = {
            "schemaVersion": 1,
            "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
            "title": "EMBER global raw detection preview",
            "producer": "NASA LANCE FIRMS",
            "mirror": "Portolan Mirrors / Source Cooperative (independent, not NASA)",
            "method": (
                "For each named year and month, sum exact count_YYYYMMDD columns "
                "from that year's aggregate-r5.parquet, rank nonzero A5 cells, and "
                "retain the 1,200 highest-count cells for display."
            ),
            "warning": (
                "Raw mixed-sensor detection counts are not harmonized and cannot be "
                "compared as a single long-term physical fire trend."
            ),
            "periods": periods,
        }
        write_json(OUTPUT, json.dumps(payload, separators=(",", ":")))
        print(
            json.dumps(
                {
                    "output": str(OUTPUT),
                    "periods": [
                        {
                            "period": period["period"],
                            "globalTotal": period["globalTotal"],
                            "displayedCells": len(period["cells"]),
                        }
                        for period in periods
                    ],
                },
                indent=2,
            )
        )
    finally:
        connection.close()


if __name__ == "__main__":
    main()
