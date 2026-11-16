"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { withBasePath } from "@/lib/base-path";

import type { CalendarStream } from "@/lib/calendar-data";
import { canPresentValidatedCalibration, type CalibrationReport } from "@/lib/science/calibration-status";
import type { MonthlySeriesDataset, MonthlySeriesRow, ReferenceSeriesRow } from "@/lib/series-data";

type RegionId = "punjab" | "california";
type DayFilter = "all" | "D" | "N";
type ViewKind = "raw" | "reference";
type ChartPoint = { month: string; value: number };

const number = new Intl.NumberFormat("en");
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

function aggregateRaw(rows: MonthlySeriesRow[], region: RegionId, sensor: "MODIS" | "VIIRS_SNPP", day: DayFilter, startYear: number, endYear: number) {
  const grouped = new Map<string, number>();
  for (const row of rows) {
    const year = Number(row.month.slice(0, 4));
    if (row.region !== region || row.sensor !== sensor || row.quality !== "sp" || year < startYear || year > endYear) continue;
    if (day !== "all" && row.dayNight !== day) continue;
    grouped.set(row.month, (grouped.get(row.month) ?? 0) + row.count);
  }
  return [...grouped].sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => ({ month, value }));
}

function referencePoints(rows: ReferenceSeriesRow[], region: RegionId, stream: "MODIS" | "VIIRS_SNPP", startYear: number, endYear: number) {
  return rows.filter((row) => row.region === region && row.stream === stream && row.referenceIndex != null && Number(row.month.slice(0, 4)) >= startYear && Number(row.month.slice(0, 4)) <= endYear)
    .map((row) => ({ month: row.month, value: row.referenceIndex! }));
}

function SeriesChart({ points, label, metric, color, focused }: { points: ChartPoint[]; label: string; metric: string; color: string; focused?: boolean }) {
  const width = 760;
  const height = 250;
  const pad = { top: 24, right: 22, bottom: 34, left: 48 };
  const peak = Math.max(...points.map((point) => point.value), 0);
  const scaleMax = Math.max(peak, metric.includes("reference") ? 100 : 1);
  const min = 0;
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const ordinals = points.map((point) => Number(point.month.slice(0, 4)) * 12 + Number(point.month.slice(5, 7)));
  const firstOrdinal = ordinals[0] ?? 0;
  const lastOrdinal = ordinals.at(-1) ?? firstOrdinal;
  const path = points.map((point, index) => {
    const ordinal = ordinals[index];
    const x = pad.left + (lastOrdinal === firstOrdinal ? 0 : (ordinal - firstOrdinal) / (lastOrdinal - firstOrdinal)) * innerWidth;
    const y = pad.top + innerHeight - ((point.value - min) / (scaleMax - min || 1)) * innerHeight;
    const previous = index ? ordinals[index - 1] : ordinal;
    return `${index === 0 || ordinal - previous > 1 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
  const median = points.length ? [...points].sort((a, b) => a.value - b.value)[Math.floor(points.length / 2)].value : 0;

  return (
    <section className={`series-card${focused ? " is-focused" : ""}`}>
      <header><div><span>{metric}</span><h2>{label}</h2></div><div><span>Peak month</span><strong>{compact.format(peak)}</strong><small>Median {compact.format(median)}</small></div></header>
      {points.length ? <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label} ${metric} timeline`}>
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = pad.top + innerHeight * fraction;
          return <line key={fraction} x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="chart-grid" />;
        })}
        {metric.includes("reference") ? <line x1={pad.left} x2={width - pad.right} y1={pad.top + innerHeight - (100 / scaleMax) * innerHeight} y2={pad.top + innerHeight - (100 / scaleMax) * innerHeight} className="chart-reference" /> : null}
        <path d={path} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <text x={pad.left} y={height - 10}>{points[0].month}</text><text x={width - pad.right} y={height - 10} textAnchor="end">{points.at(-1)?.month}</text><text x={pad.left - 8} y={pad.top + 4} textAnchor="end">{compact.format(scaleMax)}</text><text x={pad.left - 8} y={pad.top + innerHeight} textAnchor="end">0</text>
      </svg> : <div className="series-empty">No positive-detection months are available for this slice. This is unavailable, not confirmed zero fire.</div>}
      <footer><span>{points.length} available monthly values</span><span>Independent vertical scale</span></footer>
    </section>
  );
}

export function SensorCompare({ initialRegion, initialStartYear, initialEndYear, focus }: { initialRegion: RegionId; initialStartYear: number; initialEndYear: number; focus: CalendarStream | null }) {
  const [data, setData] = useState<MonthlySeriesDataset | null>(null);
  const [calibration, setCalibration] = useState<CalibrationReport | null>(null);
  const [calibrationError, setCalibrationError] = useState(false);
  const [error, setError] = useState(false);
  const [region, setRegion] = useState<RegionId>(initialRegion);
  const [day, setDay] = useState<DayFilter>("all");
  const [view, setView] = useState<ViewKind>("raw");
  const [startYear, setStartYear] = useState(initialStartYear);
  const [endYear, setEndYear] = useState(initialEndYear);

  useEffect(() => {
    const controller = new AbortController();
    fetch(withBasePath("/data/regional-monthly-series.json"), { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<MonthlySeriesDataset>; })
      .then((dataset) => {
        setData(dataset);
        setStartYear(Math.min(dataset.period.endYear, Math.max(dataset.period.startYear, initialStartYear)));
        setEndYear(Math.min(dataset.period.endYear, Math.max(dataset.period.startYear, initialEndYear)));
      })
      .catch((reason: unknown) => { if ((reason as { name?: string }).name !== "AbortError") setError(true); });
    return () => controller.abort();
  }, [initialEndYear, initialStartYear]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(withBasePath("/data/calibration-experiment.json"), { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<CalibrationReport>; })
      .then(setCalibration)
      .catch((reason: unknown) => { if ((reason as { name?: string }).name !== "AbortError") setCalibrationError(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ region, day, view, start: String(startYear), end: String(endYear) });
    if (focus) params.set("focus", focus);
    window.history.replaceState({}, "", `/compare?${params}`);
  }, [day, endYear, focus, region, startYear, view]);

  const modis = useMemo(() => data ? (view === "raw" ? aggregateRaw(data.monthly, region, "MODIS", day, startYear, endYear) : referencePoints(data.referenceSeries, region, "MODIS", startYear, endYear)) : [], [data, day, endYear, region, startYear, view]);
  const viirs = useMemo(() => data ? (view === "raw" ? aggregateRaw(data.monthly, region, "VIIRS_SNPP", day, startYear, endYear) : referencePoints(data.referenceSeries, region, "VIIRS_SNPP", startYear, endYear)) : [], [data, day, endYear, region, startYear, view]);
  const independent = useMemo(() => {
    if (!data) return [];
    const grouped = new Map<string, { count: number; quality: Set<string>; first: string; last: string }>();
    for (const row of data.monthly) {
      if (row.region !== region || !row.sensor.startsWith("VIIRS_NOAA")) continue;
      const target = grouped.get(row.sensor) ?? { count: 0, quality: new Set<string>(), first: row.month, last: row.month };
      target.count += row.count; target.quality.add(row.quality); target.first = target.first < row.month ? target.first : row.month; target.last = target.last > row.month ? target.last : row.month;
      grouped.set(row.sensor, target);
    }
    return [...grouped].map(([sensor, values]) => ({ sensor, ...values }));
  }, [data, region]);

  if (error) return <main className="compare-state"><p className="eyebrow">Sensor comparison / unavailable</p><h1>The verified time series could not be loaded.</h1><p>No substitute data was inserted.</p><Link href="/">Return to globe</Link></main>;
  if (!data) return <main className="compare-state" role="status"><p className="eyebrow">Sensor comparison</p><h1>Loading separate instrument histories.</h1><span>Raw monthly detections · sensor-aware</span></main>;

  const years = Array.from({ length: data.period.endYear - data.period.startYear + 1 }, (_, index) => data.period.startYear + index);
  return (
    <main className="compare-shell">
      <header className="compare-header"><Link className="brand-lockup" href="/"><span className="brand-mark">E</span><span><strong>EMBER</strong><small>Sensor diagnostics</small></span></Link><nav><Link href="/explore">Explore</Link><Link href={`/calendar?region=${region}&year=${endYear}&sensor=MODIS&date=${endYear}-04-29`}>Calendar</Link><Link href="/analogs">Analogs</Link><Link href="/method">Method</Link></nav></header>
      <section className="compare-intro"><p className="eyebrow">Instrument record / {data.regions[region].label}</p><h1>Two histories.<br />No false equivalence.</h1><p>MODIS and VIIRS SNPP appear in separate panels with independent vertical scales. Raw counts measure detected pixels from different instruments—not one interchangeable fire record.</p></section>
      <section className="compare-controls" aria-label="Comparison controls">
        <label><span>Region</span><select value={region} onChange={(event) => setRegion(event.target.value as RegionId)}><option value="punjab">Punjab, Pakistan</option><option value="california">California, USA</option></select></label>
        <label><span>Start year</span><select value={startYear} onChange={(event) => setStartYear(Number(event.target.value))}>{years.filter((year) => year <= endYear).map((year) => <option key={year}>{year}</option>)}</select></label>
        <label><span>End year</span><select value={endYear} onChange={(event) => setEndYear(Number(event.target.value))}>{years.filter((year) => year >= startYear).map((year) => <option key={year}>{year}</option>)}</select></label>
        <fieldset><legend>Overpass light {view === "reference" ? "· all only in reference" : ""}</legend><div>{[["all", "All"], ["D", "Day"], ["N", "Night"]].map(([value, label]) => <button key={value} type="button" disabled={view === "reference" && value !== "all"} aria-pressed={day === value} onClick={() => setDay(value as DayFilter)}>{label}</button>)}</div></fieldset>
        <fieldset><legend>Metric view</legend><div>{[["raw", "Raw counts"], ["reference", "Seasonal reference"]].map(([value, label]) => <button key={value} type="button" aria-pressed={view === value} onClick={() => { setView(value as ViewKind); if (value === "reference") setDay("all"); }}>{label}</button>)}</div></fieldset>
      </section>

      <div className="comparison-warning"><strong>{view === "raw" ? "Raw counts are not directly comparable" : "Within-sensor indices are not harmonized"}</strong><span>{view === "raw" ? "Each panel uses its own scale and keeps SP quality." : "100 is that sensor’s own calendar-month baseline median. Target year 2025 is excluded."}</span></div>
      <section className="series-stack">
        <SeriesChart points={modis} label="MODIS · Terra + Aqua" metric={view === "raw" ? "raw_sensor_count · SP" : "MODIS seasonal reference index"} color="#f4a36e" focused={focus === "MODIS"} />
        <SeriesChart points={viirs} label="VIIRS · Suomi-NPP" metric={view === "raw" ? "raw_sensor_count · SP" : "VIIRS SNPP seasonal reference index"} color="#74a7b3" focused={focus === "VIIRS_SNPP"} />
      </section>

      <section className="fleet-section"><div><p className="eyebrow">The fleet changes</p><h2>New platforms add new streams.</h2><p>NOAA-20 and NOAA-21 remain independent below. They are not appended to the Suomi-NPP reference series.</p></div><div className="fleet-timeline">{data.fleet.map((row) => {
        const left = ((Number(row.firstMonth.slice(0, 4)) - data.period.startYear) / Math.max(1, data.period.endYear - data.period.startYear)) * 100;
        const right = 100 - ((Number(row.lastMonth.slice(0, 4)) - data.period.startYear) / Math.max(1, data.period.endYear - data.period.startYear)) * 100;
        return <div className="fleet-row" key={`${row.sensor}-${row.satellite}-${row.quality}`}><span>{row.satellite}<small>{row.sensor} · {row.quality.toUpperCase()}</small></span><i><b style={{ left: `${left}%`, right: `${right}%` }} /></i><strong>{row.firstMonth.slice(0, 4)}—{row.lastMonth.slice(0, 4)}</strong></div>;
      })}</div></section>

      <section className="independent-streams"><div><p className="eyebrow">Independent VIIRS streams</p><h2>Kept outside the reference line.</h2></div>{independent.map((row) => <article key={row.sensor}><span>{row.sensor}</span><strong>{number.format(row.count)}</strong><small>{row.first}—{row.last} · {[...row.quality].map((quality) => quality.toUpperCase()).join(" / ")}</small></article>)}</section>
      {calibration ? <section className="calibration-section" id="calibration">
        <div className="calibration-copy">
          <p className="eyebrow">Overlap experiment / {canPresentValidatedCalibration(calibration) ? "validated" : "not validated"}</p>
          <h2>{canPresentValidatedCalibration(calibration) ? "Held-out gates cleared." : "Better fit. Still not a unified truth."}</h2>
          <p>The experiment predicts the MODIS-reference monthly count from overlapping VIIRS SNPP SP months. It is alignment to another sensor—not fire ground truth.</p>
          <div className="calibration-metrics">
            <div><span>Train / hold-out</span><strong>{calibration.split.training.join("–")} / {calibration.split.validation.join("–")}</strong></div>
            <div><span>Overlap months</span><strong>{calibration.trainingSampleCount} / {calibration.validationSampleCount}</strong></div>
            <div><span>Baseline MAE</span><strong>{number.format(Math.round(calibration.metrics.overall.constantRatio.mae))}</strong></div>
            <div><span>Experimental MAE</span><strong>{number.format(Math.round(calibration.metrics.overall.experimental.mae))}</strong></div>
          </div>
          <div className="calibration-gates">{calibration.gates.map((gate) => <div key={gate.id} data-passed={gate.passed}><span>{gate.passed ? "Pass" : "Fail"}</span><p>{gate.requirement}</p></div>)}</div>
          {!canPresentValidatedCalibration(calibration) ? <div className="calibration-decision"><strong>Release decision: keep the sensor series separate.</strong><span>No validated-index toggle is exposed. Geographic breadth failed, and 2020 was a held-out regression year.</span></div> : null}
          <Link href="/method#validation">Read the experimental method ↗</Link>
        </div>
        <div className="calibration-plot"><Image src={withBasePath("/data/calibration-year-mae.svg")} alt="Held-out MAE by year for the constant-ratio baseline and experimental regional seasonal fit" width={1280} height={620} unoptimized /><p>{calibration.uncertainty}</p></div>
      </section> : calibrationError ? <section className="calibration-unavailable"><strong>Experiment report unavailable</strong><span>The separate source histories remain available; no substitute validation result was inserted.</span></section> : null}
      <footer className="compare-notes"><p>{data.caveat}</p><p>Pipeline {data.pipelineVersion} · generated {data.generatedAtUtc.slice(0, 10)} · exact duplicate rows removed: {number.format(data.processing.exactDuplicateRowsRemoved)}</p><Link href="/method#sensor-differences">Read methods and limitations ↗</Link></footer>
    </main>
  );
}
