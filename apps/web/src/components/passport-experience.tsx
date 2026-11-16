"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/base-path";

import type { CalendarDataset, CalendarStream } from "@/lib/calendar-data";
import type { CalibrationReport } from "@/lib/science/calibration-status";
import type { RegionId } from "@/lib/regional-data";
import { peakPriorMonth, seasonalReference } from "@/lib/science/seasonal-reference";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const number = new Intl.NumberFormat("en");
const decimal = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

export function PassportExperience({ initialRegion, initialStream, initialYear, initialDate }: { initialRegion: RegionId; initialStream: CalendarStream; initialYear: number; initialDate: string }) {
  const [data, setData] = useState<CalendarDataset | null>(null);
  const [calibration, setCalibration] = useState<CalibrationReport | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch(withBasePath("/data/regional-calendar-series.json"), { signal: controller.signal }).then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<CalendarDataset>; }),
      fetch(withBasePath("/data/calibration-experiment.json"), { signal: controller.signal }).then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<CalibrationReport>; }),
    ]).then(([calendar, experiment]) => { setData(calendar); setCalibration(experiment); }).catch((reason: unknown) => { if ((reason as { name?: string }).name !== "AbortError") setFailed(true); });
    return () => controller.abort();
  }, [initialDate, initialRegion, initialStream, initialYear]);

  if (failed) return <main className="passport-state"><p className="eyebrow">Fire season passport / unavailable</p><h1>The verified regional record could not be loaded.</h1><p>No substitute facts were inserted.</p><Link href="/calendar">Return to calendar</Link></main>;
  if (!data || !calibration) return <main className="passport-state" role="status"><p className="eyebrow">Fire season passport</p><h1>Composing the evidence sheet.</h1><span>Real regional data · print-ready</span></main>;

  const region = data.regions[initialRegion];
  const scoped = data.daily.filter((row) => row.region === initialRegion && row.stream === initialStream);
  const yearRows = scoped.filter((row) => row.date.startsWith(`${initialYear}-`));
  const monthRows = months.map((_, index) => {
    const rows = yearRows.filter((row) => Number(row.date.slice(5, 7)) === index + 1);
    return { month: index + 1, count: rows.reduce((sum, row) => sum + row.count, 0), days: rows.length };
  });
  const maxMonthCount = Math.max(...monthRows.map((row) => row.count), 1);
  const strongestYearMonth = [...monthRows].sort((a, b) => b.count - a.count)[0];
  const selectedRow = scoped.find((row) => row.date === initialDate) ?? null;
  const reference = seasonalReference(scoped, initialRegion, initialStream, initialDate);
  const historicalPeak = peakPriorMonth(scoped, initialRegion, initialStream, initialYear);
  const [west, south, east, north] = region.bounds;
  const sensorLabel = initialStream === "MODIS" ? "MODIS Terra + Aqua" : "VIIRS Suomi-NPP";
  const stableStart = data.streams[initialStream].stableStartYear;
  const calendarHref = `/calendar?region=${initialRegion}&year=${initialYear}&sensor=${initialStream}&date=${initialDate}`;

  return <main className="passport-shell">
    <div className="passport-toolbar" aria-label="Passport actions"><Link href={calendarHref}>← Back to calendar</Link><div><span>Print formats: A4 / US Letter</span><button type="button" onClick={() => window.print()}>Print / Save PDF</button></div></div>
    <article className="passport-sheet">
      <header className="passport-masthead"><div><span className="passport-mark">E</span><div><strong>EMBER</strong><small>Fire Season Passport</small></div></div><div><span>Regional evidence sheet</span><strong>{initialYear} / {initialStream === "MODIS" ? "M" : "V"}</strong></div></header>

      <section className="passport-hero"><div><p className="passport-kicker">{region.label} · {sensorLabel} · SP</p><h1>{region.label}</h1><p className="passport-deck">A source-linked seasonal signature for {initialYear}, read as satellite-detected thermal-anomaly pixels - not unique fires or burned area.</p></div><div className="passport-stamp"><span>Selected UTC date</span><strong>{initialDate}</strong><small>Snapshot {data.generatedAtUtc.slice(0, 10)}</small></div></section>

      <section className="passport-lead"><div><span>Computed regional finding</span><h2>{months[strongestYearMonth.month - 1]} carries {initialYear}&apos;s largest raw monthly count.</h2><p>{number.format(strongestYearMonth.count)} {initialStream === "MODIS" ? "MODIS" : "VIIRS SNPP"} SP detected pixels across {strongestYearMonth.days} positive-detection UTC days. Missing days were not treated as zero.</p></div><div className="passport-selected"><span>Selected day</span><strong>{selectedRow ? number.format(selectedRow.count) : "Unavailable"}</strong><small>{selectedRow ? "detected pixels" : "not confirmed zero"}</small>{reference.status === "ready" ? <p>{decimal.format(reference.percentile)}th percentile among {reference.sampleCount} same-month positive days in {reference.yearCount} prior years.</p> : <p>{reference.status === "insufficient" ? "Not enough comparable history." : reference.reason}</p>}</div></section>

      <section className="passport-signature"><header><div><span>01 / Seasonal signature</span><h2>Twelve months, one named sensor stream.</h2></div><p>Raw {initialYear} totals. Bar length is relative within this sheet only.</p></header><div>{monthRows.map((row) => <div key={row.month} className={row.month === strongestYearMonth.month ? "peak" : ""}><span>{months[row.month - 1]}</span><i><b style={{ height: `${row.days ? Math.max(5, row.count / maxMonthCount * 100) : 0}%` }} /></i><strong>{row.days ? number.format(row.count) : "-"}</strong><small>{row.days ? `${row.days} days` : "unavailable"}</small></div>)}</div></section>

      <section className="passport-facts">
        <div><span>02 / Prior seasonal context</span><strong>{historicalPeak ? months[historicalPeak.month - 1] : "Insufficient"}</strong><p>{historicalPeak ? `Highest median positive-day count in the stable prior ${sensorLabel} record: ${historicalPeak.sampleCount} detected days across ${historicalPeak.yearCount} years.` : "Not enough prior positive-day history."}</p></div>
        <div><span>03 / Location extent</span><strong>{west.toFixed(2)}° to {east.toFixed(2)}° E/W</strong><p>{south.toFixed(2)}° to {north.toFixed(2)}° N. Rectangular AOI verified from the regional analysis; it is not an administrative polygon.</p></div>
        <div><span>04 / Record window</span><strong>{stableStart}-{data.period.endYear}</strong><p>SP-only {sensorLabel}. Dates are UTC. Positive detections cannot establish observed no-fire coverage.</p></div>
      </section>

      <section className="passport-provenance"><div><span>Source badges</span><p><b>NASA LANCE FIRMS</b><b>Portolan mirror</b><b>{initialStream} · SP</b><b>UTC</b></p></div><div><span>Validation status</span><p>{calibration.status === "unvalidated" ? "Cross-sensor experiment unvalidated; source histories remain separate." : "See method/version before interpreting a combined index."}</p></div><div><span>Data caution</span><p>A detection is not a unique fire. FRP is not burned area. Missing is not zero. No cause or emergency severity is inferred.</p></div></section>

      <footer className="passport-footer"><div><strong>Continue the analysis</strong><span>{calendarHref}</span></div><div><a href="https://firms.modaps.eosdis.nasa.gov/download/">NASA FIRMS archive</a><a href="https://source.coop/portolan-mirrors/firms-catalog">Portolan catalog</a><Link href="/method">Methods & limits</Link></div><span>EMBER · evidence over equivalence</span></footer>
    </article>
  </main>;
}
