export type MonthlySeriesRow = {
  region: "punjab" | "california";
  month: string;
  sensor: "MODIS" | "VIIRS_SNPP" | "VIIRS_NOAA20" | "VIIRS_NOAA21";
  satellite: string;
  quality: "sp" | "nrt";
  dayNight: "D" | "N";
  sourceCount: number;
  count: number;
  duplicateCount: number;
  sumFrpMw: number;
};

export type ReferenceSeriesRow = {
  region: "punjab" | "california";
  stream: "MODIS" | "VIIRS_SNPP";
  month: string;
  rawCount: number;
  metricKind: "modis_reference_index" | "viirs_reference_index";
  referenceIndex: number | null;
  referenceDefinition: string;
};

export type SeasonalProfileRow = {
  region: "punjab" | "california";
  stream: "MODIS" | "VIIRS_SNPP";
  calendarMonth: number;
  metricKind: "modis_reference_index" | "viirs_reference_index";
  baselineStartYear: number;
  baselineEndYear: number;
  excludedTargetYear: number;
  availableYears: number[];
  n: number;
  medianCount: number;
  meanCount: number;
  q25Count: number;
  q75Count: number;
};

export type FleetRow = {
  sensor: string;
  satellite: string;
  quality: "sp" | "nrt";
  firstMonth: string;
  lastMonth: string;
  count: number;
};

export type MonthlySeriesDataset = {
  schemaVersion: number;
  pipelineVersion: string;
  generatedAtUtc: string;
  period: { startYear: number; endYear: number };
  targetYear: number;
  metricKind: "raw_sensor_count";
  unit: string;
  regions: Record<string, { label: string; bounds: number[] }>;
  source: {
    producer: string;
    mirror: string;
    pathPattern: string;
    forbiddenPatternNotUsed: string;
    unavailableYears: Array<{ year: number; error: string }>;
  };
  processing: {
    sourceRows: number;
    analysisRowsAfterExactDeduplication: number;
    exactDuplicateRowsRemoved: number;
    duplicateDefinition: string;
    coverage: string;
    utc: string;
  };
  caveat: string;
  fleet: FleetRow[];
  monthly: MonthlySeriesRow[];
  seasonalProfiles: SeasonalProfileRow[];
  referenceSeries: ReferenceSeriesRow[];
};
