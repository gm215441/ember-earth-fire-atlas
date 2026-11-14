import type { CalendarDailyRow, CalendarStream } from "../calendar-data";
import type { RegionId } from "../regional-data";

export type SeasonalReference =
  | { status: "unavailable"; reason: string }
  | { status: "insufficient"; reason: string; sampleCount: number; yearCount: number }
  | {
      status: "ready";
      selectedCount: number;
      sampleCount: number;
      yearCount: number;
      baselineStartYear: number;
      baselineEndYear: number;
      q25: number;
      median: number;
      q75: number;
      anomalyScore: number;
      percentile: number;
    };

const STABLE_START: Record<CalendarStream, number> = { MODIS: 2003, VIIRS_SNPP: 2013 };

function quantile(values: number[], fraction: number) {
  const ordered = [...values].sort((a, b) => a - b);
  const position = (ordered.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.min(lower + 1, ordered.length - 1);
  return ordered[lower] * (1 - (position - lower)) + ordered[upper] * (position - lower);
}

export function seasonalReference(
  rows: CalendarDailyRow[],
  region: RegionId,
  stream: CalendarStream,
  selectedDate: string,
): SeasonalReference {
  const selected = rows.find((row) => row.region === region && row.stream === stream && row.date === selectedDate);
  if (!selected) return { status: "unavailable", reason: "No positive-detection row is available for this UTC date." };

  const selectedYear = Number(selectedDate.slice(0, 4));
  const selectedMonth = selectedDate.slice(5, 7);
  const stableStart = STABLE_START[stream];
  const baseline = rows.filter((row) => {
    const year = Number(row.date.slice(0, 4));
    return row.region === region
      && row.stream === stream
      && row.date.slice(5, 7) === selectedMonth
      && year >= stableStart
      && year < selectedYear;
  });
  const years = new Set(baseline.map((row) => Number(row.date.slice(0, 4))));
  if (baseline.length < 20 || years.size < 3) {
    return {
      status: "insufficient",
      reason: "Not enough comparable prior-year positive-detection days for a stable reference.",
      sampleCount: baseline.length,
      yearCount: years.size,
    };
  }

  const values = baseline.map((row) => row.count);
  const q25 = quantile(values, 0.25);
  const median = quantile(values, 0.5);
  const q75 = quantile(values, 0.75);
  const iqr = Math.max(q75 - q25, 1);
  return {
    status: "ready",
    selectedCount: selected.count,
    sampleCount: values.length,
    yearCount: years.size,
    baselineStartYear: Math.min(...years),
    baselineEndYear: Math.max(...years),
    q25,
    median,
    q75,
    anomalyScore: (selected.count - median) / iqr,
    percentile: values.filter((value) => value <= selected.count).length / values.length * 100,
  };
}

export function peakPriorMonth(
  rows: CalendarDailyRow[],
  region: RegionId,
  stream: CalendarStream,
  beforeYear: number,
) {
  const stableStart = STABLE_START[stream];
  const grouped = new Map<number, number[]>();
  const yearSets = new Map<number, Set<number>>();
  for (const row of rows) {
    const year = Number(row.date.slice(0, 4));
    if (row.region !== region || row.stream !== stream || year < stableStart || year >= beforeYear) continue;
    const month = Number(row.date.slice(5, 7));
    grouped.set(month, [...(grouped.get(month) ?? []), row.count]);
    const years = yearSets.get(month) ?? new Set<number>();
    years.add(year);
    yearSets.set(month, years);
  }
  const ranked = [...grouped].map(([month, values]) => ({
    month,
    medianPositiveDayCount: quantile(values, 0.5),
    sampleCount: values.length,
    yearCount: yearSets.get(month)?.size ?? 0,
  })).filter((row) => row.sampleCount >= 20 && row.yearCount >= 3)
    .sort((a, b) => b.medianPositiveDayCount - a.medianPositiveDayCount || a.month - b.month);
  return ranked[0] ?? null;
}
