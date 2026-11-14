import { RegionalExplorer } from "@/components/regional-explorer";
import type { DayNightFilter, QualityFilter, RegionId, SensorFamily } from "@/lib/regional-data";

export const instant = false;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const region: RegionId = one(query.region) === "california" ? "california" : "punjab";
  const sensorValue = one(query.sensor);
  const sensor: SensorFamily = sensorValue === "modis" || sensorValue === "viirs" ? sensorValue : "all";
  const qualityValue = one(query.quality);
  const quality: QualityFilter = qualityValue === "sp" || qualityValue === "nrt" ? qualityValue : "all";
  const lightValue = one(query.daynight);
  const dayNight: DayNightFilter = lightValue === "D" || lightValue === "N" ? lightValue : "all";
  const start = one(query.start) ?? "2025-01-01";
  const end = one(query.end) ?? "2025-12-31";
  const longitude = Number(one(query.lng));
  const latitude = Number(one(query.lat));
  const zoom = Number(one(query.zoom));
  const initialView = Number.isFinite(longitude) && Number.isFinite(latitude) && Number.isFinite(zoom)
    ? { longitude, latitude, zoom }
    : undefined;

  return <RegionalExplorer initialFilters={{ region, start, end, sensor, platform: one(query.platform) ?? "all", quality, dayNight }} initialView={initialView} />;
}
