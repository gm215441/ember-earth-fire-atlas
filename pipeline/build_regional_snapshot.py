from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from source import connect, head_metadata, year_detections


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "apps" / "web" / "public" / "data" / "regional-2025.json"
ARTIFACT = ROOT / "artifacts" / "data" / "phase05-regional-build.json"
YEAR = 2025
SOURCE_URL = year_detections(YEAR)
SAMPLE_PER_SENSOR_MONTH = 200

REGIONS = {
    "punjab": {
        "label": "Punjab, Pakistan",
        "bounds": [69.2617570, 27.7055479, 75.3814778, 34.0187570],
        "center": [72.35, 31.0],
        "zoom": 5.7,
        "boundarySource": {
            "name": "OpenStreetMap Nominatim",
            "osmType": "relation",
            "osmId": 357988,
            "checkedAtUtc": "2026-11-14T00:00:00Z",
        },
    },
    "california": {
        "label": "California, USA",
        "bounds": [-124.4820030, 32.5295236, -114.1307816, 42.0094990],
        "center": [-119.55, 37.25],
        "zoom": 5.0,
        "boundarySource": {
            "name": "OpenStreetMap Nominatim",
            "osmType": "relation",
            "osmId": 165475,
            "checkedAtUtc": "2026-11-14T00:00:00Z",
        },
    },
}


def region_clause(bounds: list[float]) -> str:
    west, south, east, north = bounds
    return (
        "ST_Within(geometry, "
        f"ST_MakeEnvelope({west}, {south}, {east}, {north}))"
    )


def build_region(connection, slug: str, config: dict) -> dict:
    clause = region_clause(config["bounds"])
    daily_rows = connection.execute(
        f"""
        SELECT
            strftime(acq_date, '%Y-%m-%d') AS date,
            sensor,
            satellite,
            quality,
            daynight,
            count(*)::INTEGER AS count
        FROM read_parquet('{SOURCE_URL}')
        WHERE {clause}
        GROUP BY ALL
        ORDER BY 1, 2, 3, 4, 5
        """
    ).fetchall()

    observation_rows = connection.execute(
        f"""
        WITH regional AS (
            SELECT
                acq_datetime,
                sensor,
                satellite,
                instrument,
                quality,
                version,
                frp,
                daynight,
                confidence,
                confidence_pct,
                type,
                ST_X(geometry) AS longitude,
                ST_Y(geometry) AS latitude,
                row_number() OVER (
                    PARTITION BY sensor, date_trunc('month', acq_datetime)
                    ORDER BY
                        hash(acq_datetime, ST_X(geometry), ST_Y(geometry), satellite),
                        acq_datetime
                ) AS sample_rank
            FROM read_parquet('{SOURCE_URL}')
            WHERE {clause}
        )
        SELECT * EXCLUDE (sample_rank)
        FROM regional
        WHERE sample_rank <= {SAMPLE_PER_SENSOR_MONTH}
        ORDER BY acq_datetime, sensor, satellite
        """
    ).fetchall()

    observations = [
        {
            "id": f"{slug}-{index + 1}",
            "acquiredUtc": row[0].isoformat(timespec="seconds") + "Z",
            "sensor": row[1],
            "satellite": row[2],
            "instrument": row[3],
            "quality": row[4],
            "version": row[5],
            "frpMw": row[6],
            "dayNight": row[7],
            "confidence": row[8],
            "confidencePct": row[9],
            "sourceType": row[10],
            "longitude": round(row[11], 5),
            "latitude": round(row[12], 5),
        }
        for index, row in enumerate(observation_rows)
    ]

    daily_counts = [
        {
            "date": row[0],
            "sensor": row[1],
            "satellite": row[2],
            "quality": row[3],
            "dayNight": row[4],
            "count": row[5],
        }
        for row in daily_rows
    ]

    return {
        **config,
        "aoiKind": "verified administrative bounding box; not polygon-clipped",
        "fullObservationCount": sum(row[5] for row in daily_rows),
        "displaySampleCount": len(observations),
        "dailyCounts": daily_counts,
        "observations": observations,
    }


def main() -> None:
    connection = connect()
    metadata = head_metadata(SOURCE_URL)
    payload = {
        "schemaVersion": 1,
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
        "period": {"start": "2025-01-01", "end": "2025-12-31"},
        "metricKind": "raw_sensor_count",
        "unit": "satellite-detected thermal-anomaly pixels",
        "sampling": {
            "method": "deterministic display sample by sensor and UTC month",
            "maxPerSensorMonth": SAMPLE_PER_SENSOR_MONTH,
            "note": (
                "Daily counts describe every source row in each rectangular AOI; "
                "map points are a deterministic performance sample."
            ),
        },
        "provenance": {
            "producer": "NASA LANCE FIRMS",
            "mirror": "Portolan FIRMS catalog on Source Cooperative",
            "sourceUrl": SOURCE_URL,
            "sourceMetadata": metadata,
            "sourceQuality": (
                "Preserves source-provided SP/NRT labels; NRT is provisional."
            ),
            "caveat": (
                "A row is a detected thermal-anomaly pixel, not a unique fire or "
                "burned area. Positive-only records cannot establish coverage or "
                "confirmed no-fire conditions. MODIS and VIIRS counts are not "
                "directly comparable."
            ),
        },
        "regions": {
            slug: build_region(connection, slug, config)
            for slug, config in REGIONS.items()
        },
    }

    serialized = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(serialized + "\n", encoding="utf-8")
    ARTIFACT.parent.mkdir(parents=True, exist_ok=True)
    ARTIFACT.write_text(
        json.dumps(
            {
                "output": str(OUTPUT.relative_to(ROOT)),
                "bytes": OUTPUT.stat().st_size,
                "sourceMetadata": metadata,
                "regions": {
                    slug: {
                        "fullObservationCount": region["fullObservationCount"],
                        "displaySampleCount": region["displaySampleCount"],
                        "dailyCountRows": len(region["dailyCounts"]),
                    }
                    for slug, region in payload["regions"].items()
                },
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(ARTIFACT.read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
