from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from source import (
    ALLTIME_R5,
    bucket_columns,
    connect,
    head_metadata,
    schema,
    timed_query,
    write_json,
    year_r5,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "artifacts" / "data" / "phase01-source-inspection.json"
YEAR = 2025


def inspect_table(connection, name: str, url: str, bucket_prefix: str) -> dict:
    table_schema = schema(connection, url)
    buckets = bucket_columns(table_schema, bucket_prefix)
    if not buckets:
        raise RuntimeError(f"No bucket columns matching {bucket_prefix!r} in {url}")

    sample_rows, sample_seconds = timed_query(
        connection,
        f"""
        SELECT a5_cell, count, round(sum_frp, 2) AS sum_frp
        FROM read_parquet('{url}')
        ORDER BY count DESC
        LIMIT 5
        """,
    )
    total_rows, total_seconds = timed_query(
        connection,
        f"SELECT sum(count)::BIGINT FROM read_parquet('{url}')",
    )
    bucket_expression = " + ".join(
        f"coalesce(\"{column}\", 0)" for column in buckets
    )
    bucket_rows, bucket_seconds = timed_query(
        connection,
        f"""
        SELECT sum({bucket_expression})::BIGINT
        FROM read_parquet('{url}')
        """,
    )
    total = total_rows[0][0]
    bucket_total = bucket_rows[0][0]
    if total != bucket_total:
        raise RuntimeError(
            f"{name}: count total {total} != bucket total {bucket_total}"
        )

    return {
        "name": name,
        "http": head_metadata(url),
        "schema": table_schema,
        "bucket_prefix": bucket_prefix,
        "bucket_count": len(buckets),
        "bucket_first": buckets[0],
        "bucket_last": buckets[-1],
        "total_detection_pixels": total,
        "bucket_total_detection_pixels": bucket_total,
        "sample_top_cells": [
            {"a5_cell": row[0], "count": row[1], "sum_frp_mw": row[2]}
            for row in sample_rows
        ],
        "runtime_seconds": {
            "sample": sample_seconds,
            "total": total_seconds,
            "bucket_validation": bucket_seconds,
        },
    }


def main() -> None:
    connection = connect()
    try:
        payload = {
            "generated_at_utc": datetime.now(timezone.utc).isoformat(),
            "producer": "NASA LANCE FIRMS",
            "mirror": "Portolan Mirrors on Source Cooperative (independent; not NASA)",
            "queries_use_exact_filenames": True,
            "tables": [
                inspect_table(connection, "alltime-r5", ALLTIME_R5, "count_20"),
                inspect_table(
                    connection,
                    f"year-{YEAR}-aggregate-r5",
                    year_r5(YEAR),
                    f"count_{YEAR}",
                ),
            ],
            "caveats": [
                "Counts are detected thermal-anomaly pixels, not unique fires or burned area.",
                "All-time monthly buckets are mixed-fleet raw counts and are not harmonized.",
                "Year aggregates have separate daily and per-sensor totals, not day-by-sensor cross-tabs.",
                "Positive-only detection tables cannot prove observed no-fire coverage.",
            ],
        }
        write_json(OUTPUT, json.dumps(payload, indent=2))
        print(json.dumps({"output": str(OUTPUT), "tables": payload["tables"]}, indent=2))
    finally:
        connection.close()


if __name__ == "__main__":
    main()
