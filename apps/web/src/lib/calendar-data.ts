import type { RegionId } from "./regional-data";

export type CalendarStream = "MODIS" | "VIIRS_SNPP";

export type CalendarDailyRow = {
  region: RegionId;
  date: string;
  stream: CalendarStream;
  count: number;
  sourceCount: number;
  duplicateCount: number;
};

export type CalendarDataset = {
  schemaVersion: number;
  pipelineVersion: string;
  generatedAtUtc: string;
  sourceGeneratedAtUtc: string;
  period: { startYear: number; endYear: number };
  metricKind: "raw_sensor_count";
  unit: string;
  regions: Record<RegionId, { label: string; bounds: [number, number, number, number] }>;
  streams: Record<CalendarStream, { sensor: CalendarStream; stableStartYear: number }>;
  source: {
    producer: string;
    mirror: string;
    pathPattern: string;
    snapshots: Array<Record<string, unknown>>;
    unavailableYears: Array<{ year: number; error: string }>;
  };
  processing: {
    quality: "sp";
    aggregation: string;
    missingDays: string;
    referenceRule: string;
    sourceRows: number;
    exactDuplicateRowsRemoved: number;
  };
  caveat: string;
  daily: CalendarDailyRow[];
};
