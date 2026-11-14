export type RegionId = "punjab" | "california";
export type SensorFamily = "all" | "modis" | "viirs";
export type QualityFilter = "all" | "sp" | "nrt";
export type DayNightFilter = "all" | "D" | "N";

export type RegionalObservation = {
  id: string;
  acquiredUtc: string;
  sensor: string;
  satellite: string;
  instrument: string;
  quality: "sp" | "nrt";
  version: string;
  frpMw: number | null;
  dayNight: "D" | "N";
  confidence: string;
  confidencePct: number | null;
  sourceType: number | null;
  longitude: number;
  latitude: number;
};

export type DailyCount = {
  date: string;
  sensor: string;
  satellite: string;
  quality: "sp" | "nrt";
  dayNight: "D" | "N";
  count: number;
};

export type RegionalArea = {
  label: string;
  bounds: [number, number, number, number];
  center: [number, number];
  zoom: number;
  boundarySource: {
    name: string;
    osmType: string;
    osmId: number;
    checkedAtUtc: string;
  };
  aoiKind: string;
  fullObservationCount: number;
  displaySampleCount: number;
  dailyCounts: DailyCount[];
  observations: RegionalObservation[];
};

export type RegionalDataset = {
  schemaVersion: number;
  generatedAtUtc: string;
  period: { start: string; end: string };
  metricKind: "raw_sensor_count";
  unit: string;
  sampling: {
    method: string;
    maxPerSensorMonth: number;
    note: string;
  };
  provenance: {
    producer: string;
    mirror: string;
    sourceUrl: string;
    sourceMetadata: {
      content_length_bytes: number;
      etag: string;
      last_modified: string;
      checked_at_utc: string;
    };
    sourceQuality: string;
    caveat: string;
  };
  regions: Record<RegionId, RegionalArea>;
};

export type ExplorerFilters = {
  region: RegionId;
  start: string;
  end: string;
  sensor: SensorFamily;
  platform: string;
  quality: QualityFilter;
  dayNight: DayNightFilter;
};

export function sensorMatches(sensor: string, family: SensorFamily) {
  if (family === "all") return true;
  return family === "modis" ? sensor === "MODIS" : sensor.startsWith("VIIRS");
}

export function confidenceLabel(observation: RegionalObservation) {
  if (observation.sensor === "MODIS") {
    return `${observation.confidencePct ?? observation.confidence}% · native numeric`;
  }
  const labels: Record<string, string> = { l: "low", n: "nominal", h: "high" };
  const value = observation.confidence.toLowerCase();
  return `${labels[value] ?? observation.confidence} · native category`;
}
