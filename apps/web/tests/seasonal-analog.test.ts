import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { calculateSeasonalAnalog } from "../src/lib/science/seasonal-analog";
import type { MonthlySeriesDataset } from "../src/lib/series-data";

const dataset = JSON.parse(readFileSync(resolve(process.cwd(), "public/data/regional-monthly-series.json"), "utf8")) as MonthlySeriesDataset;

describe("seasonal analog", () => {
  it("finds the measured MODIS phase offset without mixing sensor families", () => {
    const result = calculateSeasonalAnalog(dataset.seasonalProfiles, "MODIS");
    expect(result.commonYears).toHaveLength(22);
    expect(result.sourcePeakMonth).toBe(11);
    expect(result.targetPeakMonth).toBe(8);
    expect(result.signedOffsetMonths).toBe(-3);
    expect(result.directSimilarity).toBeCloseTo(0.3572, 4);
    expect(result.bestSimilarity).toBeCloseTo(0.8157, 4);
  });

  it("keeps the shorter VIIRS SNPP history independent", () => {
    const result = calculateSeasonalAnalog(dataset.seasonalProfiles, "VIIRS_SNPP");
    expect(result.commonYears).toHaveLength(12);
    expect(result.baselineStartYear).toBe(2013);
    expect(result.baselineEndYear).toBe(2024);
    expect(result.signedOffsetMonths).toBe(-3);
    expect(result.bestSimilarity).toBeCloseTo(0.8114, 4);
  });
});
