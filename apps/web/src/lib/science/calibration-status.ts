export type CalibrationMetric = {
  n: number;
  mae: number;
  rmse: number;
  medianApePct: number;
  smapePct: number;
  r2AgainstModis: number;
};

export type CalibrationGate = {
  id: string;
  requirement: string;
  passed: boolean;
  value: unknown;
};

export type CalibrationReport = {
  schemaVersion: number;
  methodId: string;
  status: "validated" | "unvalidated";
  decision: "publish_validated_index" | "keep_sensor_series_separate";
  generatedAtUtc: string;
  target: string;
  predictor: string;
  overlapRule: string;
  split: { training: [number, number]; validation: [number, number]; kind: "chronological" };
  trainingSampleCount: number;
  validationSampleCount: number;
  metrics: {
    overall: Record<"unadjusted" | "constantRatio" | "experimental", CalibrationMetric>;
    byRegion: Record<string, Record<"unadjusted" | "constantRatio" | "experimental", CalibrationMetric>>;
    byYear: Array<{ year: number; unadjusted: CalibrationMetric; constantRatio: CalibrationMetric; experimental: CalibrationMetric }>;
  };
  gates: CalibrationGate[];
  uncertainty: string;
  caveat: string;
  plots: string[];
};

export function canPresentValidatedCalibration(report: CalibrationReport) {
  return report.status === "validated"
    && report.decision === "publish_validated_index"
    && report.gates.length > 0
    && report.gates.every((gate) => gate.passed);
}

export function calibrationMetricKind(report: CalibrationReport) {
  return canPresentValidatedCalibration(report) ? "validated_harmonized_index" as const : "experimental_calibration" as const;
}
