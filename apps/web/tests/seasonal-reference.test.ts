import { describe, expect, it } from "vitest";

import type { CalendarDailyRow } from "../src/lib/calendar-data";
import { peakPriorMonth, seasonalReference } from "../src/lib/science/seasonal-reference";

function row(date: string, count: number): CalendarDailyRow {
  return { region: "punjab", date, stream: "MODIS", count, sourceCount: count, duplicateCount: 0 };
}

const history = [2021, 2022, 2023, 2024].flatMap((year, yearIndex) =>
  Array.from({ length: 8 }, (_, day) => row(`${year}-04-${String(day + 1).padStart(2, "0")}`, 10 + yearIndex * 2 + day)),
);

describe("prior-years seasonal reference", () => {
  it("excludes the selected year and every future year from the score", () => {
    const selected = row("2024-04-20", 42);
    const future = Array.from({ length: 20 }, (_, day) => row(`2025-04-${String(day + 1).padStart(2, "0")}`, 10_000));
    const result = seasonalReference([...history, selected, ...future], "punjab", "MODIS", selected.date);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.baselineEndYear).toBe(2023);
    expect(result.sampleCount).toBe(24);
    expect(result.q75).toBeLessThan(10_000);
  });

  it("does not silently turn a missing positive-detection day into zero", () => {
    expect(seasonalReference(history, "punjab", "MODIS", "2025-04-29")).toEqual({
      status: "unavailable",
      reason: "No positive-detection row is available for this UTC date.",
    });
  });

  it("reports insufficient history instead of producing a weak score", () => {
    const selected = row("2023-04-20", 30);
    const result = seasonalReference([...history, selected], "punjab", "MODIS", selected.date);
    expect(result.status).toBe("insufficient");
    if (result.status !== "insufficient") return;
    expect(result.yearCount).toBe(2);
  });

  it("derives the peak seasonal month only from stable prior years", () => {
    const may = [2021, 2022, 2023].flatMap((year) => Array.from({ length: 8 }, (_, day) => row(`${year}-05-${String(day + 1).padStart(2, "0")}`, 100 + day)));
    const peak = peakPriorMonth([...history, ...may], "punjab", "MODIS", 2024);
    expect(peak?.month).toBe(5);
    expect(peak?.yearCount).toBe(3);
  });
});
