import { SensorCompare } from "@/components/sensor-compare";
import type { CalendarStream } from "@/lib/calendar-data";
import type { RegionId } from "@/lib/regional-data";

export default async function ComparePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const region: RegionId = one(query.region) === "california" ? "california" : "punjab";
  const start = Number(one(query.start));
  const end = Number(one(query.end));
  const focusValue = one(query.focus);
  const focus: CalendarStream | null = focusValue === "MODIS" || focusValue === "VIIRS_SNPP" ? focusValue : null;
  return <SensorCompare initialRegion={region} initialStartYear={Number.isInteger(start) ? start : 2000} initialEndYear={Number.isInteger(end) ? end : 2025} focus={focus} />;
}
