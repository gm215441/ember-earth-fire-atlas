import { SeasonalAnalogExperience } from "@/components/seasonal-analog-experience";
import type { AnalogStream } from "@/lib/science/seasonal-analog";

export const instant = false;
export const metadata = { title: "EMBER - Seasonal Analogs" };

export default async function AnalogsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const value = Array.isArray(query.stream) ? query.stream[0] : query.stream;
  const stream: AnalogStream = value === "VIIRS_SNPP" ? "VIIRS_SNPP" : "MODIS";
  return <SeasonalAnalogExperience initialStream={stream} />;
}
