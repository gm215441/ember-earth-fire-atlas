import type { SeasonalProfileRow } from "@/lib/series-data";

export type AnalogStream = "MODIS" | "VIIRS_SNPP";
export type AnalogRegion = "punjab" | "california";

export type AnalogMonth = {
  month: number;
  medianCount: number;
  share: number;
};

export type SeasonalAnalogResult = {
  stream: AnalogStream;
  source: AnalogMonth[];
  target: AnalogMonth[];
  directSimilarity: number;
  bestSimilarity: number;
  signedOffsetMonths: number;
  sourcePeakMonth: number;
  targetPeakMonth: number;
  commonYears: number[];
  baselineStartYear: number;
  baselineEndYear: number;
};

function cosine(left: number[], right: number[]) {
  const dot = left.reduce((sum, value, index) => sum + value * right[index], 0);
  const leftNorm = Math.sqrt(left.reduce((sum, value) => sum + value * value, 0));
  const rightNorm = Math.sqrt(right.reduce((sum, value) => sum + value * value, 0));
  return leftNorm && rightNorm ? dot / (leftNorm * rightNorm) : 0;
}

function profileFor(rows: SeasonalProfileRow[], region: AnalogRegion, stream: AnalogStream) {
  const profile = rows
    .filter((row) => row.region === region && row.stream === stream)
    .sort((left, right) => left.calendarMonth - right.calendarMonth);
  if (profile.length !== 12 || profile.some((row, index) => row.calendarMonth !== index + 1)) {
    throw new Error(`A complete 12-month ${stream} profile is required for ${region}.`);
  }
  const total = profile.reduce((sum, row) => sum + row.medianCount, 0);
  if (total <= 0) throw new Error(`The ${stream} profile for ${region} has no positive median counts.`);
  return {
    rows: profile,
    months: profile.map((row) => ({ month: row.calendarMonth, medianCount: row.medianCount, share: row.medianCount / total })),
  };
}

export function calculateSeasonalAnalog(rows: SeasonalProfileRow[], stream: AnalogStream): SeasonalAnalogResult {
  const sourceProfile = profileFor(rows, "punjab", stream);
  const targetProfile = profileFor(rows, "california", stream);
  const sourceShares = sourceProfile.months.map((row) => row.share);
  const targetShares = targetProfile.months.map((row) => row.share);
  const directSimilarity = cosine(sourceShares, targetShares);

  let bestOffset = 0;
  let bestSimilarity = -1;
  for (let offset = 0; offset < 12; offset += 1) {
    const shifted = sourceShares.map((_, index) => targetShares[(index + offset) % 12]);
    const similarity = cosine(sourceShares, shifted);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestOffset = offset;
    }
  }

  const sourceYears = new Set(sourceProfile.rows[0].availableYears);
  const commonYears = targetProfile.rows[0].availableYears.filter((year) => sourceYears.has(year));
  const sourcePeak = sourceProfile.months.reduce((peak, row) => row.medianCount > peak.medianCount ? row : peak);
  const targetPeak = targetProfile.months.reduce((peak, row) => row.medianCount > peak.medianCount ? row : peak);

  return {
    stream,
    source: sourceProfile.months,
    target: targetProfile.months,
    directSimilarity,
    bestSimilarity,
    signedOffsetMonths: bestOffset <= 6 ? bestOffset : bestOffset - 12,
    sourcePeakMonth: sourcePeak.month,
    targetPeakMonth: targetPeak.month,
    commonYears,
    baselineStartYear: Math.max(sourceProfile.rows[0].baselineStartYear, targetProfile.rows[0].baselineStartYear),
    baselineEndYear: Math.min(sourceProfile.rows[0].baselineEndYear, targetProfile.rows[0].baselineEndYear),
  };
}
