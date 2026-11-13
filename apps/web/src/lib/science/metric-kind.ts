export const metricKinds = [
  "raw_sensor_count",
  "modis_reference_index",
  "viirs_reference_index",
  "experimental_calibration",
  "validated_harmonized_index",
  "unavailable",
] as const;

export type MetricKind = (typeof metricKinds)[number];

export function isValidatedHarmonizedMetric(kind: MetricKind): boolean {
  return kind === "validated_harmonized_index";
}
