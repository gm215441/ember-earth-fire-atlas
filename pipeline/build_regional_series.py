from __future__ import annotations

import argparse
import json
import statistics
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError

from source import connect, head_metadata, schema, year_detections


ROOT = Path(__file__).resolve().parents[1]
CACHE_DIR = ROOT / "pipeline" / "cache" / "regional-series"
MONTHLY_OUTPUT = ROOT / "apps" / "web" / "public" / "data" / "regional-monthly-series.json"
DAILY_OUTPUT = ROOT / "apps" / "web" / "public" / "data" / "regional-daily-series.json"
BUILD_ARTIFACT = ROOT / "artifacts" / "data" / "phase06-series-build.json"
PIPELINE_VERSION = "phase06-v1"
TARGET_YEAR = 2025

REGIONS = {
    "punjab": {
        "label": "Punjab, Pakistan",
        "bounds": [69.2617570, 27.7055479, 75.3814778, 34.0187570],
    },
    "california": {
        "label": "California, USA",
        "bounds": [-124.4820030, 32.5295236, -114.1307816, 42.0094990],
    },
}

PRIMARY_STREAMS = {
    "MODIS": {"sensor": "MODIS", "quality": "sp", "baseline": [2003, 2024]},
    "VIIRS_SNPP": {"sensor": "VIIRS_SNPP", "quality": "sp", "baseline": [2013, 2024]},
}


def envelope(bounds: list[float]) -> str:
    west, south, east, north = bounds
    return f"ST_MakeEnvelope({west}, {south}, {east}, {north})"


def extract_year(connection, year: int) -> dict[str, Any]:
    url = year_detections(year)
    punjab = envelope(REGIONS["punjab"]["bounds"])
    california = envelope(REGIONS["california"]["bounds"])
    metadata = head_metadata(url)
    query = f"""
    WITH filtered AS (
        SELECT
            CASE
                WHEN ST_Within(geometry, {punjab}) THEN 'punjab'
                WHEN ST_Within(geometry, {california}) THEN 'california'
            END AS region,
            acq_datetime,
            acq_date,
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
            ST_Y(geometry) AS latitude
        FROM read_parquet('{url}')
        WHERE year = {year}
          AND (
              ST_Within(geometry, {punjab})
              OR ST_Within(geometry, {california})
          )
          AND sensor IN ('MODIS', 'VIIRS_SNPP', 'VIIRS_NOAA20', 'VIIRS_NOAA21')
    ),
    deduped AS (
        SELECT * EXCLUDE (duplicate_rank)
        FROM (
            SELECT *, row_number() OVER (
                PARTITION BY
                    region, acq_datetime, sensor, satellite, quality, frp,
                    daynight, confidence, confidence_pct, type, longitude, latitude
                ORDER BY acq_datetime
            ) AS duplicate_rank
            FROM filtered
        )
        WHERE duplicate_rank = 1
    ),
    source_counts AS (
        SELECT region, acq_date, sensor, satellite, quality, daynight,
               count(*)::INTEGER AS source_count
        FROM filtered
        GROUP BY ALL
    ),
    analysis_counts AS (
        SELECT
            region,
            acq_date,
            sensor,
            satellite,
            quality,
            daynight,
            count(*)::INTEGER AS count,
            round(sum(frp), 3) AS sum_frp_mw,
            min(confidence_pct) FILTER (WHERE sensor = 'MODIS') AS modis_confidence_min,
            max(confidence_pct) FILTER (WHERE sensor = 'MODIS') AS modis_confidence_max,
            count(*) FILTER (WHERE sensor != 'MODIS' AND lower(confidence) = 'l')::INTEGER AS viirs_confidence_low,
            count(*) FILTER (WHERE sensor != 'MODIS' AND lower(confidence) = 'n')::INTEGER AS viirs_confidence_nominal,
            count(*) FILTER (WHERE sensor != 'MODIS' AND lower(confidence) = 'h')::INTEGER AS viirs_confidence_high
        FROM deduped
        GROUP BY ALL
    )
    SELECT
        a.region,
        strftime(a.acq_date, '%Y-%m-%d') AS date,
        a.sensor,
        a.satellite,
        a.quality,
        a.daynight,
        s.source_count,
        a.count,
        s.source_count - a.count AS duplicate_count,
        a.sum_frp_mw,
        a.modis_confidence_min,
        a.modis_confidence_max,
        a.viirs_confidence_low,
        a.viirs_confidence_nominal,
        a.viirs_confidence_high
    FROM analysis_counts a
    JOIN source_counts s USING (region, acq_date, sensor, satellite, quality, daynight)
    ORDER BY 1, 2, 3, 4, 5, 6
    """
    rows = connection.execute(query).fetchall()
    daily = [
        {
            "region": row[0],
            "date": row[1],
            "sensor": row[2],
            "satellite": row[3],
            "quality": row[4],
            "dayNight": row[5],
            "sourceCount": row[6],
            "count": row[7],
            "duplicateCount": row[8],
            "sumFrpMw": row[9],
            "modisConfidenceMin": row[10],
            "modisConfidenceMax": row[11],
            "viirsConfidenceLow": row[12],
            "viirsConfidenceNominal": row[13],
            "viirsConfidenceHigh": row[14],
        }
        for row in rows
    ]
    return {"year": year, "source": metadata, "daily": daily}


def quantile(values: list[int], fraction: float) -> float:
    ordered = sorted(values)
    if len(ordered) == 1:
        return float(ordered[0])
    position = (len(ordered) - 1) * fraction
    lower = int(position)
    upper = min(lower + 1, len(ordered) - 1)
    weight = position - lower
    return ordered[lower] * (1 - weight) + ordered[upper] * weight


def build_monthly(daily: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[tuple[str, str, str, str, str, str], dict[str, Any]] = {}
    for row in daily:
        key = (
            row["region"], row["date"][:7], row["sensor"], row["satellite"],
            row["quality"], row["dayNight"],
        )
        target = grouped.setdefault(key, {
            "region": key[0], "month": key[1], "sensor": key[2],
            "satellite": key[3], "quality": key[4], "dayNight": key[5],
            "sourceCount": 0, "count": 0, "duplicateCount": 0,
            "sumFrpMw": 0.0,
        })
        target["sourceCount"] += row["sourceCount"]
        target["count"] += row["count"]
        target["duplicateCount"] += row["duplicateCount"]
        target["sumFrpMw"] += row["sumFrpMw"] or 0.0
    for row in grouped.values():
        row["sumFrpMw"] = round(row["sumFrpMw"], 3)
    return sorted(grouped.values(), key=lambda row: (
        row["region"], row["month"], row["sensor"], row["satellite"],
        row["quality"], row["dayNight"],
    ))


def aggregate_primary(monthly: list[dict[str, Any]]) -> dict[tuple[str, str, str], int]:
    values: dict[tuple[str, str, str], int] = defaultdict(int)
    for row in monthly:
        for stream, config in PRIMARY_STREAMS.items():
            if row["sensor"] == config["sensor"] and row["quality"] == config["quality"]:
                values[(row["region"], stream, row["month"])] += row["count"]
    return dict(values)


def build_profiles(primary: dict[tuple[str, str, str], int]) -> list[dict[str, Any]]:
    profile_values: dict[tuple[str, str, int], list[tuple[int, int]]] = defaultdict(list)
    for (region, stream, month), count in primary.items():
        year = int(month[:4])
        calendar_month = int(month[5:7])
        start, end = PRIMARY_STREAMS[stream]["baseline"]
        if start <= year <= end and year != TARGET_YEAR:
            profile_values[(region, stream, calendar_month)].append((year, count))

    profiles = []
    for (region, stream, calendar_month), year_counts in sorted(profile_values.items()):
        counts = [count for _, count in year_counts]
        start, end = PRIMARY_STREAMS[stream]["baseline"]
        profiles.append({
            "region": region,
            "stream": stream,
            "calendarMonth": calendar_month,
            "metricKind": "modis_reference_index" if stream == "MODIS" else "viirs_reference_index",
            "baselineStartYear": start,
            "baselineEndYear": end,
            "excludedTargetYear": TARGET_YEAR,
            "availableYears": sorted(year for year, _ in year_counts),
            "n": len(counts),
            "medianCount": round(statistics.median(counts), 3),
            "meanCount": round(statistics.fmean(counts), 3),
            "q25Count": round(quantile(counts, 0.25), 3),
            "q75Count": round(quantile(counts, 0.75), 3),
        })
    return profiles


def build_reference_series(
    primary: dict[tuple[str, str, str], int],
    profiles: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    profile_map = {
        (row["region"], row["stream"], row["calendarMonth"]): row
        for row in profiles
    }
    output = []
    for (region, stream, month), count in sorted(primary.items()):
        profile = profile_map.get((region, stream, int(month[5:7])))
        median = profile["medianCount"] if profile else None
        output.append({
            "region": region,
            "stream": stream,
            "month": month,
            "rawCount": count,
            "metricKind": "modis_reference_index" if stream == "MODIS" else "viirs_reference_index",
            "referenceIndex": round(count / median * 100, 3) if median else None,
            "referenceDefinition": "100 = same-stream median for this calendar month",
        })
    return output


def build_fleet(monthly: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[tuple[str, str, str], dict[str, Any]] = {}
    for row in monthly:
        key = (row["sensor"], row["satellite"], row["quality"])
        target = grouped.setdefault(key, {
            "sensor": key[0], "satellite": key[1], "quality": key[2],
            "firstMonth": row["month"], "lastMonth": row["month"], "count": 0,
        })
        target["firstMonth"] = min(target["firstMonth"], row["month"])
        target["lastMonth"] = max(target["lastMonth"], row["month"])
        target["count"] += row["count"]
    return sorted(grouped.values(), key=lambda row: (row["firstMonth"], row["sensor"], row["satellite"], row["quality"]))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start-year", type=int, default=2000)
    parser.add_argument("--end-year", type=int, default=2025)
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    if args.start_year > args.end_year:
        raise SystemExit("start year must be <= end year")

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    connection = connect()
    first_url = year_detections(args.start_year)
    measured_schema = schema(connection, first_url)
    year_results = []
    unavailable = []

    for year in range(args.start_year, args.end_year + 1):
        cache_path = CACHE_DIR / f"{year}.json"
        if cache_path.exists() and not args.refresh:
            result = json.loads(cache_path.read_text(encoding="utf-8"))
            print(f"{year}: cache hit ({len(result['daily'])} daily rows)", flush=True)
            year_results.append(result)
            continue
        print(f"{year}: scanning exact detections.parquet", flush=True)
        try:
            result = extract_year(connection, year)
        except (HTTPError, URLError, OSError, RuntimeError, Exception) as error:
            message = f"{type(error).__name__}: {error}"
            print(f"{year}: unavailable: {message}", flush=True)
            unavailable.append({"year": year, "error": message})
            continue
        cache_path.write_text(json.dumps(result, separators=(",", ":")) + "\n", encoding="utf-8")
        print(f"{year}: {len(result['daily'])} daily rows", flush=True)
        year_results.append(result)

    daily = [row for result in year_results for row in result["daily"]]
    monthly = build_monthly(daily)
    primary = aggregate_primary(monthly)
    profiles = build_profiles(primary)
    reference_series = build_reference_series(primary, profiles)
    source_snapshots = [result["source"] for result in year_results]
    duplicate_rows = sum(row["duplicateCount"] for row in daily)
    source_rows = sum(row["sourceCount"] for row in daily)
    analysis_rows = sum(row["count"] for row in daily)
    generated_at = datetime.now(timezone.utc).isoformat()

    common = {
        "schemaVersion": 1,
        "pipelineVersion": PIPELINE_VERSION,
        "generatedAtUtc": generated_at,
        "period": {"startYear": args.start_year, "endYear": args.end_year},
        "targetYear": TARGET_YEAR,
        "metricKind": "raw_sensor_count",
        "unit": "satellite-detected thermal-anomaly pixels",
        "regions": REGIONS,
        "source": {
            "producer": "NASA LANCE FIRMS",
            "mirror": "Portolan FIRMS catalog on Source Cooperative",
            "pathPattern": "detections/year={YYYY}/detections.parquet",
            "forbiddenPatternNotUsed": "year=*/*.parquet",
            "schema": measured_schema,
            "snapshots": source_snapshots,
            "unavailableYears": unavailable,
        },
        "processing": {
            "geometry": "DuckDB Spatial ST_Within against disclosed rectangular AOIs",
            "yearPruning": "one exact yearly detections.parquet URL per scan plus explicit year predicate",
            "duplicateDefinition": "identical acquisition UTC, sensor, satellite, quality, FRP, day/night, native confidence, type code and point coordinates",
            "sourceRows": source_rows,
            "analysisRowsAfterExactDeduplication": analysis_rows,
            "exactDuplicateRowsRemoved": duplicate_rows,
            "utc": "source acq_datetime and acq_date interpreted as UTC",
            "coverage": "unknown; positive-only detections cannot establish observed no-fire",
        },
        "caveat": (
            "Counts are raw sensor detections, not unique fires or burned area. "
            "MODIS and VIIRS are not directly comparable. Climate, cloud, smoke, "
            "overpass timing, sensor availability and land management can affect "
            "the record; this pipeline does not infer causes or observation coverage."
        ),
    }
    monthly_payload = {
        **common,
        "fleet": build_fleet(monthly),
        "monthly": monthly,
        "seasonalProfiles": profiles,
        "referenceSeries": reference_series,
    }
    daily_payload = {**common, "daily": daily}
    MONTHLY_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    MONTHLY_OUTPUT.write_text(json.dumps(monthly_payload, separators=(",", ":")) + "\n", encoding="utf-8")
    DAILY_OUTPUT.write_text(json.dumps(daily_payload, separators=(",", ":")) + "\n", encoding="utf-8")
    BUILD_ARTIFACT.parent.mkdir(parents=True, exist_ok=True)
    artifact = {
        "pipelineVersion": PIPELINE_VERSION,
        "command": f"python pipeline/build_regional_series.py --start-year {args.start_year} --end-year {args.end_year}",
        "yearsRequested": list(range(args.start_year, args.end_year + 1)),
        "yearsProcessed": [result["year"] for result in year_results],
        "unavailableYears": unavailable,
        "sourceRows": source_rows,
        "analysisRowsAfterExactDeduplication": analysis_rows,
        "exactDuplicateRowsRemoved": duplicate_rows,
        "dailyRows": len(daily),
        "monthlyRows": len(monthly),
        "profileRows": len(profiles),
        "referenceRows": len(reference_series),
        "monthlyOutputBytes": MONTHLY_OUTPUT.stat().st_size,
        "dailyOutputBytes": DAILY_OUTPUT.stat().st_size,
        "completedAtUtc": generated_at,
    }
    BUILD_ARTIFACT.write_text(json.dumps(artifact, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(artifact, indent=2), flush=True)


if __name__ == "__main__":
    main()
