import type { MetricKind } from "./metric-kind";

export type RawMetricState = {
  kind: "raw_sensor_count";
  sensor: string;
  quality: "sp" | "nrt";
  periodStartUtc: string;
  periodEndUtc: string;
  value: number | null;
  observedMaskAvailable: boolean;
};

export type ReferenceMetricState = {
  kind: "modis_reference_index" | "viirs_reference_index";
  sensor: "MODIS" | "VIIRS_SNPP";
  baselineStartYear: number;
  baselineEndYear: number;
  excludedTargetYear: number;
  value: number | null;
};

export type MetricState = RawMetricState | ReferenceMetricState | {
  kind: Exclude<MetricKind, RawMetricState["kind"] | ReferenceMetricState["kind"]>;
  value: number | null;
};

export function utcDateKey(isoTimestamp: string) {
  if (!isoTimestamp.endsWith("Z")) throw new Error("Acquisition timestamp must be explicit UTC");
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid acquisition timestamp");
  return date.toISOString().slice(0, 10);
}

export function canClaimObservedNoFire(metric: RawMetricState) {
  return metric.value === 0 && metric.observedMaskAvailable;
}

export function baselineExcludesTarget(metric: ReferenceMetricState) {
  return metric.excludedTargetYear < metric.baselineStartYear
    || metric.excludedTargetYear > metric.baselineEndYear;
}

export function metricPresentationLabel(metric: MetricState) {
  if (metric.kind === "raw_sensor_count") return "Raw sensor detections";
  if (metric.kind === "modis_reference_index") return "MODIS seasonal reference index";
  if (metric.kind === "viirs_reference_index") return "VIIRS SNPP seasonal reference index";
  if (metric.kind === "validated_harmonized_index") return "Validated harmonized index";
  if (metric.kind === "experimental_calibration") return "Experimental calibration";
  return "Unavailable";
}
