"use client";

import { useSearchParams } from "next/navigation";

import { CalendarExperience } from "@/components/calendar-experience";
import { PassportExperience } from "@/components/passport-experience";
import { RegionalExplorer } from "@/components/regional-explorer";
import { ScienceTour } from "@/components/science-tour";
import { SeasonalAnalogExperience } from "@/components/seasonal-analog-experience";
import { SensorCompare } from "@/components/sensor-compare";
import type { CalendarStream } from "@/lib/calendar-data";
import type { DayNightFilter, QualityFilter, RegionId, SensorFamily } from "@/lib/regional-data";
import type { AnalogStream } from "@/lib/science/seasonal-analog";

export function ExploreRouteEntry() {
  const query = useSearchParams();
  const region: RegionId = query.get("region") === "california" ? "california" : "punjab";
  const sensorValue = query.get("sensor");
  const sensor: SensorFamily = sensorValue === "modis" || sensorValue === "viirs" ? sensorValue : "all";
  const qualityValue = query.get("quality");
  const quality: QualityFilter = qualityValue === "sp" || qualityValue === "nrt" ? qualityValue : "all";
  const lightValue = query.get("daynight");
  const dayNight: DayNightFilter = lightValue === "D" || lightValue === "N" ? lightValue : "all";
  const longitude = Number(query.get("lng"));
  const latitude = Number(query.get("lat"));
  const zoom = Number(query.get("zoom"));
  const initialView = query.has("lng") && query.has("lat") && query.has("zoom") && Number.isFinite(longitude) && Number.isFinite(latitude) && Number.isFinite(zoom)
    ? { longitude, latitude, zoom }
    : undefined;

  return <RegionalExplorer initialFilters={{
    region,
    start: query.get("start") ?? "2025-01-01",
    end: query.get("end") ?? "2025-12-31",
    sensor,
    platform: query.get("platform") ?? "all",
    quality,
    dayNight,
  }} initialView={initialView} />;
}

function calendarSelection(query: ReturnType<typeof useSearchParams>) {
  const region: RegionId = query.get("region") === "california" ? "california" : "punjab";
  const stream: CalendarStream = query.get("sensor") === "VIIRS_SNPP" ? "VIIRS_SNPP" : "MODIS";
  const requestedYear = Number(query.get("year"));
  const year = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= 2025 ? requestedYear : 2025;
  const requestedDate = query.get("date");
  const date = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && requestedDate.startsWith(`${year}-`)
    ? requestedDate
    : `${year}-04-29`;
  return { region, stream, year, date };
}

export function CalendarRouteEntry() {
  const selection = calendarSelection(useSearchParams());
  return <CalendarExperience initialRegion={selection.region} initialStream={selection.stream} initialYear={selection.year} initialDate={selection.date} />;
}

export function PassportRouteEntry() {
  const selection = calendarSelection(useSearchParams());
  return <PassportExperience initialRegion={selection.region} initialStream={selection.stream} initialYear={selection.year} initialDate={selection.date} />;
}

export function CompareRouteEntry() {
  const query = useSearchParams();
  const region: RegionId = query.get("region") === "california" ? "california" : "punjab";
  const start = Number(query.get("start"));
  const end = Number(query.get("end"));
  const focusValue = query.get("focus");
  const focus: CalendarStream | null = focusValue === "MODIS" || focusValue === "VIIRS_SNPP" ? focusValue : null;
  return <SensorCompare initialRegion={region} initialStartYear={Number.isInteger(start) && query.has("start") ? start : 2000} initialEndYear={Number.isInteger(end) && query.has("end") ? end : 2025} focus={focus} />;
}

export function AnalogsRouteEntry() {
  const query = useSearchParams();
  const stream: AnalogStream = query.get("stream") === "VIIRS_SNPP" ? "VIIRS_SNPP" : "MODIS";
  return <SeasonalAnalogExperience initialStream={stream} />;
}

export function TourRouteEntry() {
  const query = useSearchParams();
  const requested = Number(query.get("step"));
  const step = Number.isInteger(requested) && requested >= 1 && requested <= 5 ? requested : 1;
  return <ScienceTour initialStep={step - 1} />;
}
