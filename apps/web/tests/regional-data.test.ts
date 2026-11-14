import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { confidenceLabel, sensorMatches, type RegionalDataset } from "../src/lib/regional-data";

const dataset = JSON.parse(
  readFileSync(resolve(process.cwd(), "public/data/regional-2025.json"), "utf8"),
) as RegionalDataset;

describe("regional real-data snapshot", () => {
  it("preserves exact source provenance and complete daily totals", () => {
    expect(dataset.provenance.sourceUrl).toMatch(/year=2025\/detections\.parquet$/);
    expect(dataset.provenance.sourceUrl).not.toContain("*");
    expect(dataset.metricKind).toBe("raw_sensor_count");

    for (const region of Object.values(dataset.regions)) {
      expect(region.dailyCounts.reduce((sum, row) => sum + row.count, 0)).toBe(
        region.fullObservationCount,
      );
      expect(region.fullObservationCount).toBeGreaterThan(region.displaySampleCount);
    }
  });

  it("keeps every display point inside its disclosed rectangular AOI", () => {
    for (const region of Object.values(dataset.regions)) {
      const [west, south, east, north] = region.bounds;
      for (const row of region.observations) {
        expect(row.longitude).toBeGreaterThanOrEqual(west);
        expect(row.longitude).toBeLessThanOrEqual(east);
        expect(row.latitude).toBeGreaterThanOrEqual(south);
        expect(row.latitude).toBeLessThanOrEqual(north);
      }
    }
  });

  it("does not collapse MODIS and VIIRS confidence semantics", () => {
    const rows = Object.values(dataset.regions).flatMap((region) => region.observations);
    const modis = rows.find((row) => row.sensor === "MODIS");
    const viirs = rows.find((row) => row.sensor.startsWith("VIIRS"));
    expect(modis).toBeDefined();
    expect(viirs).toBeDefined();
    expect(confidenceLabel(modis!)).toContain("native numeric");
    expect(confidenceLabel(viirs!)).toContain("native category");
    expect(["l", "n", "h"]).toContain(viirs!.confidence.toLowerCase());
    expect(sensorMatches("MODIS", "viirs")).toBe(false);
    expect(sensorMatches("VIIRS_SNPP", "viirs")).toBe(true);
  });

  it("retains source quality flags including provisional NRT rows", () => {
    const qualities = new Set(
      Object.values(dataset.regions).flatMap((region) =>
        region.observations.map((row) => row.quality),
      ),
    );
    expect(qualities).toEqual(new Set(["sp", "nrt"]));
  });
});
