import { describe, expect, it } from "vitest";

import preview from "../public/data/global-preview.json";

describe("real-data global preview", () => {
  it("contains two distinct, nonempty source periods", () => {
    expect(preview.periods).toHaveLength(2);
    expect(preview.periods.every((period) => period.globalTotal > 0)).toBe(true);
    expect(new Set(preview.periods.map((period) => period.globalTotal)).size).toBe(
      2,
    );
  });

  it("keeps the raw mixed-sensor warning attached", () => {
    expect(preview.warning.toLowerCase()).toContain("not harmonized");
    expect(
      preview.periods.every(
        (period) => period.metricKind === "raw_sensor_count",
      ),
    ).toBe(true);
  });
});
