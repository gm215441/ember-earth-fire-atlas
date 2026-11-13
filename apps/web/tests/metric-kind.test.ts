import { describe, expect, it } from "vitest";

import {
  isValidatedHarmonizedMetric,
  metricKinds,
} from "../src/lib/science/metric-kind";

describe("scientific metric kinds", () => {
  it("does not call raw or experimental metrics harmonized", () => {
    expect(isValidatedHarmonizedMetric("raw_sensor_count")).toBe(false);
    expect(isValidatedHarmonizedMetric("experimental_calibration")).toBe(false);
  });

  it("preserves an explicit unavailable state", () => {
    expect(metricKinds).toContain("unavailable");
  });
});
