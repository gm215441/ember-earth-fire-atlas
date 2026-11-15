"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { CalendarDailyRow, CalendarDataset, CalendarStream } from "@/lib/calendar-data";
import type { RegionId, RegionalDataset, RegionalObservation } from "@/lib/regional-data";
import { peakPriorMonth, seasonalReference } from "@/lib/science/seasonal-reference";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const number = new Intl.NumberFormat("en");
const decimal = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function monthIndex(date: string) {
  return Number(date.slice(5, 7));
}

function activityLanguage(score: number) {
  if (score >= 2) return "well above the prior positive-day middle range";
  if (score >= 0.75) return "above the prior positive-day middle range";
  if (score <= -0.75) return "below the prior positive-day middle range";
  return "inside the prior positive-day middle range";
}

function MonthPulse({ rows, year, month, selectedDate }: { rows: CalendarDailyRow[]; year: number; month: number; selectedDate: string }) {
  const countByDay = new Map(rows.map((row) => [Number(row.date.slice(8, 10)), row.count]));
  const max = Math.max(...countByDay.values(), 1);
  const count = daysInMonth(year, month);
  return <svg className="month-pulse" viewBox="0 0 620 160" role="img" aria-label={`${months[month - 1]} ${year} available daily detection counts`}>
    {[0.25, 0.5, 0.75, 1].map((fraction) => <line key={fraction} x1="30" x2="600" y1={130 - 100 * fraction} y2={130 - 100 * fraction} />)}
    {Array.from({ length: count }, (_, index) => index + 1).map((day) => {
      const value = countByDay.get(day);
      const x = 30 + (day - 1) / Math.max(1, count - 1) * 570;
      const height = value == null ? 0 : value / max * 100;
      const date = isoDate(year, month, day);
      return <g key={day}>
        {value == null ? <circle cx={x} cy="130" r="1.8" className="pulse-missing" /> : <rect x={x - 2.5} y={130 - height} width="5" height={Math.max(height, 2)} className={date === selectedDate ? "pulse-selected" : "pulse-bar"} />}
      </g>;
    })}
    <text x="30" y="151">01</text><text x="600" y="151" textAnchor="end">{String(count).padStart(2, "0")}</text><text x="27" y="32" textAnchor="end">{number.format(max)}</text>
  </svg>;
}

function CoordinateMap({
  dataset,
  region,
  stream,
  date,
  fullCount,
}: {
  dataset: RegionalDataset | null;
  region: RegionId;
  stream: CalendarStream;
  date: string;
  fullCount: number | null;
}) {
  const area = dataset?.regions[region];
  const observations = useMemo(() => area?.observations.filter((row) => row.quality === "sp" && row.sensor === stream && row.acquiredUtc.slice(0, 10) === date) ?? [], [area, date, stream]);
  const bounds = area?.bounds;
  const point = (row: RegionalObservation) => {
    if (!bounds) return { x: 0, y: 0 };
    const [west, south, east, north] = bounds;
    return { x: 36 + (row.longitude - west) / (east - west) * 528, y: 314 - (row.latitude - south) / (north - south) * 268 };
  };
  const supportsCoordinates = date.startsWith("2025-");
  return <section className="calendar-map" aria-label="Selected date regional map">
    <header><div><span>Coordinate view / verified display subset</span><strong>{date} UTC</strong></div><div><span>Full SP daily count</span><strong>{fullCount == null ? "Unavailable" : number.format(fullCount)}</strong></div></header>
    <div className="calendar-map-stage" key={`${region}-${stream}-${date}`}>
      <svg viewBox="0 0 600 360" role="img" aria-label={`${area?.label ?? region} selected date map`}>
        <defs><radialGradient id="mapGlow"><stop offset="0" stopColor="#e97443" stopOpacity=".7" /><stop offset="1" stopColor="#e97443" stopOpacity="0" /></radialGradient></defs>
        {Array.from({ length: 9 }, (_, index) => <line key={`v${index}`} x1={36 + index * 66} x2={36 + index * 66} y1="46" y2="314" className="calendar-gridline" />)}
        {Array.from({ length: 6 }, (_, index) => <line key={`h${index}`} x1="36" x2="564" y1={46 + index * 53.6} y2={46 + index * 53.6} className="calendar-gridline" />)}
        <rect x="36" y="46" width="528" height="268" className="calendar-aoi" />
        {supportsCoordinates && observations.map((row) => { const xy = point(row); return <g key={row.id}><circle cx={xy.x} cy={xy.y} r="10" fill="url(#mapGlow)" /><circle cx={xy.x} cy={xy.y} r="2" className="calendar-point" /></g>; })}
        <text x="36" y="30">{area?.label ?? region}</text><text x="564" y="340" textAnchor="end">Rectangular AOI · not an administrative polygon</text>
      </svg>
      {!supportsCoordinates ? <div className="map-unavailable"><strong>Historical coordinate layer unavailable</strong><span>The long record retains verified daily sensor totals, not invented point locations. Select a 2025 date for the capped real-coordinate layer.</span></div> : observations.length === 0 ? <div className="map-unavailable"><strong>No display-sample points for this slice</strong><span>This is not confirmed no-fire; the daily series and coordinate display subset have different purposes.</span></div> : null}
    </div>
    <footer><span>{supportsCoordinates ? `${number.format(observations.length)} displayed source rows` : "Daily totals only"}</span><span>Source sample capped per sensor/month · full count kept separately</span></footer>
  </section>;
}

export function CalendarExperience({ initialRegion, initialStream, initialYear, initialDate }: { initialRegion: RegionId; initialStream: CalendarStream; initialYear: number; initialDate: string }) {
  const [data, setData] = useState<CalendarDataset | null>(null);
  const [regional, setRegional] = useState<RegionalDataset | null>(null);
  const [failed, setFailed] = useState(false);
  const [region, setRegion] = useState(initialRegion);
  const [stream, setStream] = useState(initialStream);
  const [year, setYear] = useState(initialYear);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/data/regional-calendar-series.json", { signal: controller.signal }).then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<CalendarDataset>; }),
      fetch("/data/regional-2025.json", { signal: controller.signal }).then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<RegionalDataset>; }),
    ]).then(([calendar, map]) => { setData(calendar); setRegional(map); }).catch((reason: unknown) => { if ((reason as { name?: string }).name !== "AbortError") setFailed(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ region, year: String(year), sensor: stream, date: selectedDate });
    window.history.replaceState({}, "", `/calendar?${params}`);
  }, [region, selectedDate, stream, year]);

  const selectedMonth = monthIndex(selectedDate);
  const scoped = useMemo(() => data?.daily.filter((row) => row.region === region && row.stream === stream) ?? [], [data, region, stream]);
  const yearRows = useMemo(() => scoped.filter((row) => row.date.startsWith(`${year}-`)), [scoped, year]);
  const monthRows = useMemo(() => yearRows.filter((row) => monthIndex(row.date) === selectedMonth), [selectedMonth, yearRows]);
  const selectedRow = monthRows.find((row) => row.date === selectedDate) ?? null;
  const reference = useMemo(() => seasonalReference(scoped, region, stream, selectedDate), [region, scoped, selectedDate, stream]);
  const peak = useMemo(() => peakPriorMonth(scoped, region, stream, year), [region, scoped, stream, year]);
  const monthSummaries = useMemo(() => months.map((_, index) => {
    const rows = yearRows.filter((row) => monthIndex(row.date) === index + 1);
    return { month: index + 1, count: rows.reduce((sum, row) => sum + row.count, 0), availableDays: rows.length };
  }), [yearRows]);

  const chooseYear = (nextYear: number) => {
    const month = selectedDate.slice(5, 7);
    const desiredDay = Number(selectedDate.slice(8, 10));
    const day = Math.min(desiredDay, daysInMonth(nextYear, Number(month)));
    setYear(nextYear);
    setSelectedDate(`${nextYear}-${month}-${String(day).padStart(2, "0")}`);
  };
  const chooseMonth = (month: number) => {
    const day = Math.min(Number(selectedDate.slice(8, 10)), daysInMonth(year, month));
    setSelectedDate(isoDate(year, month, day));
  };
  const mapSensor = stream === "MODIS" ? "modis" : "viirs";
  const exploreHref = `/explore?region=${region}&start=${selectedDate}&end=${selectedDate}&sensor=${mapSensor}&quality=sp&platform=all&daynight=all`;
  const compareHref = `/compare?region=${region}&start=${year}&end=${year}&focus=${stream}`;
  const passportHref = `/passport?region=${region}&year=${year}&sensor=${stream}&date=${selectedDate}`;

  if (failed) return <main className="calendar-state"><p className="eyebrow">Burning calendar / unavailable</p><h1>The verified daily series could not be loaded.</h1><p>No substitute dates or counts were inserted.</p><Link href="/">Return to globe</Link></main>;
  if (!data) return <main className="calendar-state" role="status"><p className="eyebrow">Burning calendar</p><h1>Loading daily sensor histories.</h1><span>UTC dates · SP quality · positive detections</span></main>;

  const firstWeekday = (new Date(Date.UTC(year, selectedMonth - 1, 1)).getUTCDay() + 6) % 7;
  const days = daysInMonth(year, selectedMonth);
  const dayRows = new Map(monthRows.map((row) => [Number(row.date.slice(8, 10)), row]));
  const regionLabel = data.regions[region].label;
  return <main className="calendar-shell">
    <header className="calendar-header"><Link className="brand-lockup" href="/"><span className="brand-mark">E</span><span><strong>EMBER</strong><small>Burning calendar</small></span></Link><nav><Link href="/explore">Explore</Link><Link href="/compare">Compare</Link><Link href="/method">Method</Link></nav></header>

    <section className="calendar-intro"><div><p className="eyebrow">Daily record / {regionLabel}</p><h1>Find the season.<br />Open the day.</h1></div><p>The calendar reads one stable SP sensor stream at a time. Missing dates stay unavailable, and every historical score uses prior years only—never the selected year or the future.</p></section>

    <section className="calendar-controls" aria-label="Calendar controls">
      <label><span>Region</span><select value={region} onChange={(event) => setRegion(event.target.value as RegionId)}><option value="punjab">Punjab, Pakistan</option><option value="california">California, USA</option></select></label>
      <label><span>Sensor stream</span><select value={stream} onChange={(event) => setStream(event.target.value as CalendarStream)}><option value="MODIS">MODIS · Terra + Aqua · SP</option><option value="VIIRS_SNPP">VIIRS · Suomi-NPP · SP</option></select></label>
      <label><span>UTC year</span><select value={year} onChange={(event) => chooseYear(Number(event.target.value))}>{Array.from({ length: 26 }, (_, index) => 2000 + index).map((value) => <option key={value}>{value}</option>)}</select></label>
      <div><span>Selected UTC date</span><strong>{selectedDate}</strong></div>
    </section>

    <section className="month-ribbon" aria-label="Month activity ribbon">{monthSummaries.map((summary) => <button type="button" key={summary.month} aria-pressed={summary.month === selectedMonth} onClick={() => chooseMonth(summary.month)}><span>{months[summary.month - 1]}</span><strong>{summary.availableDays ? number.format(summary.count) : "—"}</strong><small>{summary.availableDays ? `${summary.availableDays} detected days` : "unavailable"}</small></button>)}</section>

    <section className="calendar-workbench">
      <div className="calendar-month-panel">
        <header><div><p className="eyebrow">{months[selectedMonth - 1]} {year} / UTC</p><h2>Choose a detected day—or inspect a gap.</h2></div><div><span>Monthly raw count</span><strong>{monthRows.length ? number.format(monthRows.reduce((sum, row) => sum + row.count, 0)) : "Unavailable"}</strong></div></header>
        <MonthPulse rows={monthRows} year={year} month={selectedMonth} selectedDate={selectedDate} />
        <div className="weekday-row">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
        <div className="day-grid">{Array.from({ length: firstWeekday }, (_, index) => <i key={`blank-${index}`} />)}{Array.from({ length: days }, (_, index) => index + 1).map((day) => {
          const row = dayRows.get(day);
          const date = isoDate(year, selectedMonth, day);
          return <button type="button" key={day} className={date === selectedDate ? "selected" : ""} aria-label={`${date}: ${row ? `${row.count} detected pixels` : "unavailable, not zero"}`} onClick={() => setSelectedDate(date)}><span>{day}</span><strong>{row ? number.format(row.count) : "—"}</strong><small>{row ? "pixels" : "unavailable"}</small></button>;
        })}</div>
      </div>

      <aside className="calendar-reading">
        <p className="eyebrow">Selected day / computed reading</p><h2>{selectedRow ? number.format(selectedRow.count) : "No reported row"}</h2><span>{selectedRow ? "satellite-detected thermal-anomaly pixels" : "Unavailable is not confirmed zero fire"}</span>
        {reference.status === "ready" ? <div className="reference-card"><strong>{decimal.format(reference.percentile)}th percentile</strong><span>{activityLanguage(reference.anomalyScore)}</span><dl><div><dt>Robust score</dt><dd>{decimal.format(reference.anomalyScore)} IQR</dd></div><div><dt>Prior sample</dt><dd>{reference.sampleCount} days / {reference.yearCount} years</dd></div><div><dt>Middle 50%</dt><dd>{decimal.format(reference.q25)}—{decimal.format(reference.q75)}</dd></div><div><dt>Median</dt><dd>{decimal.format(reference.median)}</dd></div></dl><p>Score = (selected count − prior median) ÷ prior IQR, using positive-detection days in the same calendar month from {reference.baselineStartYear}–{reference.baselineEndYear}. It is context, not a forecast or emergency rating.</p></div> : <div className="reference-card is-empty"><strong>{reference.status === "insufficient" ? "Not enough comparable history" : "Reference unavailable"}</strong><span>{reference.reason}</span>{reference.status === "insufficient" ? <p>{reference.sampleCount} prior positive days across {reference.yearCount} years; at least 20 days and 3 prior years are required.</p> : null}</div>}
        {peak ? <div className="calendar-fact"><span>Peak prior seasonal period</span><strong>{months[peak.month - 1]}</strong><p>{regionLabel}&apos;s highest median positive-day count in the prior stable {stream === "MODIS" ? "MODIS" : "VIIRS SNPP"} record. {peak.sampleCount} detected days across {peak.yearCount} years; missing days were not treated as zero.</p></div> : null}
        <div className="calendar-actions"><Link className="passport-action" href={passportHref}>Generate Passport ↗</Link><Link href={exploreHref}>Open this date in Explore ↗</Link><Link href={compareHref}>Compare this year ↗</Link></div>
      </aside>
    </section>

    <CoordinateMap dataset={regional} region={region} stream={stream} date={selectedDate} fullCount={selectedRow?.count ?? null} />
    <footer className="calendar-notes"><p>{data.caveat}</p><p>{data.source.producer} via {data.source.mirror} · pipeline {data.pipelineVersion} · SP only · generated {data.generatedAtUtc.slice(0, 10)} · UTC dates</p><Link href="/method#coverage">Read coverage limits ↗</Link></footer>
  </main>;
}
