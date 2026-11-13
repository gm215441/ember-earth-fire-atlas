from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from time import perf_counter
from typing import Any
from urllib.request import Request, urlopen

import duckdb


MIRROR_ROOT = (
    "https://data.source.coop/portolan-mirrors/firms-catalog/detections"
)
ALLTIME_R5 = f"{MIRROR_ROOT}/alltime-r5.parquet"


def year_r5(year: int) -> str:
    return f"{MIRROR_ROOT}/year={year}/aggregate-r5.parquet"


def connect() -> duckdb.DuckDBPyConnection:
    connection = duckdb.connect()
    connection.execute("INSTALL spatial")
    connection.execute("LOAD spatial")
    connection.execute("INSTALL httpfs")
    connection.execute("LOAD httpfs")
    return connection


def timed_query(
    connection: duckdb.DuckDBPyConnection, query: str
) -> tuple[list[tuple[Any, ...]], float]:
    started = perf_counter()
    rows = connection.execute(query).fetchall()
    return rows, round(perf_counter() - started, 4)


def head_metadata(url: str) -> dict[str, Any]:
    request = Request(url, method="HEAD", headers={"User-Agent": "EMBER/0.1"})
    with urlopen(request, timeout=30) as response:
        return {
            "url": url,
            "status": response.status,
            "content_length_bytes": int(response.headers.get("Content-Length", 0)),
            "etag": response.headers.get("ETag"),
            "last_modified": response.headers.get("Last-Modified"),
            "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        }


def schema(connection: duckdb.DuckDBPyConnection, url: str) -> list[dict[str, Any]]:
    rows = connection.execute(
        f"DESCRIBE SELECT * FROM read_parquet('{url}')"
    ).fetchall()
    return [
        {"name": row[0], "type": row[1], "nullable": row[2] == "YES"}
        for row in rows
    ]


def bucket_columns(
    source_schema: list[dict[str, Any]], prefix: str
) -> list[str]:
    return sorted(
        column["name"]
        for column in source_schema
        if column["name"].startswith(prefix)
        and column["name"][len(prefix) :].isdigit()
    )


def write_json(path: Path, payload: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(payload + "\n", encoding="utf-8")
