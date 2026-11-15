import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { calibrationMetricKind, canPresentValidatedCalibration, type CalibrationReport } from "../src/lib/science/calibration-status";

const actual = JSON.parse(readFileSync(resolve("public/data/calibration-experiment.json"), "utf8")) as CalibrationReport;

describe("calibration publication guard", () => {
  it("cannot present the executed unvalidated experiment as validated", () => {
    expect(actual.status).toBe("unvalidated");
    expect(actual.gates.some((gate) => !gate.passed)).toBe(true);
    expect(canPresentValidatedCalibration(actual)).toBe(false);
    expect(calibrationMetricKind(actual)).toBe("experimental_calibration");
  });

  it("rejects a validated label when any required gate failed", () => {
    const mislabeled = { ...actual, status: "validated", decision: "publish_validated_index" } as CalibrationReport;
    expect(canPresentValidatedCalibration(mislabeled)).toBe(false);
    expect(calibrationMetricKind(mislabeled)).toBe("experimental_calibration");
  });

  it("requires the status, decision, and every gate to agree", () => {
    const passed = {
      ...actual,
      status: "validated",
      decision: "publish_validated_index",
      gates: actual.gates.map((gate) => ({ ...gate, passed: true })),
    } as CalibrationReport;
    expect(canPresentValidatedCalibration(passed)).toBe(true);
    expect(calibrationMetricKind(passed)).toBe("validated_harmonized_index");
  });
});
