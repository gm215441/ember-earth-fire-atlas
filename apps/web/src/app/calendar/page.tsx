import { CalendarExperience } from "@/components/calendar-experience";
import type { CalendarStream } from "@/lib/calendar-data";
import type { RegionId } from "@/lib/regional-data";

export const instant = false;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const region: RegionId = one(query.region) === "california" ? "california" : "punjab";
  const stream: CalendarStream = one(query.sensor) === "VIIRS_SNPP" ? "VIIRS_SNPP" : "MODIS";
  const requestedYear = Number(one(query.year));
  const year = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= 2025 ? requestedYear : 2025;
  const requestedDate = one(query.date);
  const date = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && requestedDate.startsWith(`${year}-`)
    ? requestedDate
    : `${year}-04-29`;
  return <CalendarExperience initialRegion={region} initialStream={stream} initialYear={year} initialDate={date} />;
}
