import { describe, expect, it } from "vitest";

import {
  baselineExcludesTarget,
  canClaimObservedNoFire,
  metricPresentationLabel,
  utcDateKey,
  type RawMetricState,
  type ReferenceMetricState,
} from "../src/lib/science/metric-state";

describe("science contract state", () => {
  it("requires explicit UTC acquisition timestamps", () => {
    expect(utcDateKey("2025-08-14T23:45:00Z")).toBe("2025-08-14");
    expect(() => utcDateKey("2025-08-14T23:45:00")).toThrow(/explicit UTC/);
  });

  it("never turns a positive-only zero into observed no-fire", () => {
    const metric: RawMetricState = {
      kind: "raw_sensor_count",
      sensor: "MODIS",
      quality: "sp",
      periodStartUtc: "2025-01-01",
      periodEndUtc: "2025-01-31",
      value: 0,
      observedMaskAvailable: false,
    };
    expect(canClaimObservedNoFire(metric)).toBe(false);
    expect(canClaimObservedNoFire({ ...metric, observedMaskAvailable: true })).toBe(true);
  });

  it("keeps raw metrics out of harmonized language", () => {
    const metric: RawMetricState = {
      kind: "raw_sensor_count",
      sensor: "VIIRS_SNPP",
      quality: "sp",
      periodStartUtc: "2025-01-01",
      periodEndUtc: "2025-12-31",
      value: 12,
      observedMaskAvailable: false,
    };
    expect(metricPresentationLabel(metric)).toBe("Raw sensor detections");
    expect(metricPresentationLabel(metric).toLowerCase()).not.toContain("harmonized");
  });

  it("requires a reference baseline to exclude its evaluation year", () => {
    const valid: ReferenceMetricState = {
      kind: "modis_reference_index",
      sensor: "MODIS",
      baselineStartYear: 2003,
      baselineEndYear: 2024,
      excludedTargetYear: 2025,
      value: 108,
    };
    expect(baselineExcludesTarget(valid)).toBe(true);
    expect(baselineExcludesTarget({ ...valid, excludedTargetYear: 2020 })).toBe(false);
  });
});
