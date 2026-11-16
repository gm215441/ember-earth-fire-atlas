"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { withBasePath } from "@/lib/base-path";

import { calculateSeasonalAnalog, type AnalogMonth, type AnalogStream } from "@/lib/science/seasonal-analog";
import type { MonthlySeriesDataset } from "@/lib/series-data";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const percent = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

function Profile({ label, rows, peakMonth, accent }: { label: string; rows: AnalogMonth[]; peakMonth: number; accent: "ember" | "blue" }) {
  const maxShare = Math.max(...rows.map((row) => row.share));
  return <section className={`analog-profile analog-profile-${accent}`} aria-label={`${label} normalized seasonal profile`}>
    <header><div><span>Normalized monthly share</span><h2>{label}</h2></div><div><span>Median-profile peak</span><strong>{months[peakMonth - 1]}</strong></div></header>
    <div className="analog-bars">{rows.map((row) => <div key={row.month} className={row.month === peakMonth ? "is-peak" : ""}><span>{months[row.month - 1]}</span><i><b style={{ height: `${(row.share / maxShare) * 100}%` }} /></i><strong>{percent.format(row.share * 100)}%</strong></div>)}</div>
  </section>;
}

export function SeasonalAnalogExperience({ initialStream }: { initialStream: AnalogStream }) {
  const [data, setData] = useState<MonthlySeriesDataset | null>(null);
  const [stream, setStream] = useState<AnalogStream>(initialStream);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(withBasePath("/data/regional-monthly-series.json"), { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<MonthlySeriesDataset>; })
      .then(setData)
      .catch((reason: unknown) => { if ((reason as { name?: string }).name !== "AbortError") setFailed(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    window.history.replaceState({}, "", `/analogs?stream=${stream}`);
  }, [stream]);

  const computation = useMemo(() => {
    if (!data) return { status: "loading" } as const;
    try {
      return { status: "ready", result: calculateSeasonalAnalog(data.seasonalProfiles, stream) } as const;
    } catch {
      return { status: "error" } as const;
    }
  }, [data, stream]);
  if (failed) return <main className="analog-state"><p className="eyebrow">Seasonal analog / unavailable</p><h1>The verified seasonal profiles could not be loaded.</h1><p>No substitute similarity was generated.</p><Link href="/compare">Return to sensor diagnostics</Link></main>;
  if (computation.status === "error") return <main className="analog-state"><p className="eyebrow">Seasonal analog / incomplete record</p><h1>A complete 12-month profile is unavailable.</h1><p>No substitute similarity was generated.</p><Link href="/compare">Return to sensor diagnostics</Link></main>;
  if (!data || computation.status === "loading") return <main className="analog-state" role="status"><p className="eyebrow">Seasonal analog</p><h1>Aligning named sensor profiles.</h1><span>Punjab and California · no cross-sensor mixing</span></main>;
  const result = computation.result;

  const sensorLabel = stream === "MODIS" ? "MODIS Terra + Aqua" : "VIIRS Suomi-NPP";
  const direct = result.directSimilarity * 100;
  const shifted = result.bestSimilarity * 100;
  const offset = result.signedOffsetMonths;
  const alignedTargetMonth = (month: number) => ((month - 1 + offset + 12) % 12) + 1;

  return <main className="analog-shell">
    <header className="analog-header"><Link className="brand-lockup" href="/"><span className="brand-mark">E</span><span><strong>EMBER</strong><small>Seasonal analogs</small></span></Link><nav aria-label="Analog navigation"><Link href="/compare">Compare</Link><Link href="/tour">Science tour</Link><Link href="/method">Method</Link></nav></header>

    <section className="analog-intro"><div><p className="eyebrow">Region-to-region shape / {sensorLabel} SP</p><h1>Same instrument.<br />Different calendar.</h1></div><p>EMBER normalizes each region&apos;s 12 monthly median counts into a within-region seasonal shape, then tests circular month offsets. It never compares raw Punjab totals with raw California totals and never combines MODIS with VIIRS.</p></section>

    <section className="analog-controls" aria-label="Seasonal analog sensor stream"><div><span>Named sensor stream</span><div>{(["MODIS", "VIIRS_SNPP"] as const).map((value) => <button key={value} type="button" aria-pressed={stream === value} onClick={() => setStream(value)}>{value === "MODIS" ? "MODIS Terra + Aqua" : "VIIRS Suomi-NPP"}</button>)}</div></div><p>{result.commonYears.length} common profile years · {result.baselineStartYear}-{result.baselineEndYear} · target year 2025 excluded</p></section>

    <section className="analog-verdict" aria-live="polite"><div><span>Direct calendar shape index</span><strong>{percent.format(direct)}</strong><small>of 100 · descriptive cosine index</small></div><div className="analog-offset"><span>Best circular offset</span><strong>{offset} months</strong><small>California months aligned to Punjab</small></div><div><span>Offset-aligned shape index</span><strong>{percent.format(shifted)}</strong><small>of 100 · not a probability</small></div><p>Punjab&apos;s {months[result.sourcePeakMonth - 1]} median-profile peak aligns with California&apos;s {months[result.targetPeakMonth - 1]} peak. At the best offset, each California month is read {Math.abs(offset)} months {offset < 0 ? "earlier" : "later"} than the corresponding Punjab month.</p></section>

    <div className="analog-profile-grid">
      <Profile label="Punjab, Pakistan" rows={result.source} peakMonth={result.sourcePeakMonth} accent="ember" />
      <Profile label="California, USA" rows={result.target} peakMonth={result.targetPeakMonth} accent="blue" />
    </div>

    <section className="analog-pairing"><header><div><p className="eyebrow">Best phase pairing</p><h2>Month-to-month alignment.</h2></div><p>The offset rotates California&apos;s normalized signature; it does not move observations in time or claim shared causes.</p></header><div>{result.source.map((row) => { const targetMonth = alignedTargetMonth(row.month); return <div key={row.month}><span>{months[row.month - 1]}<small>Punjab</small></span><i aria-hidden="true" /><span>{months[targetMonth - 1]}<small>California</small></span></div>; })}</div></section>

    <section className="analog-method"><div><span>What the index uses</span><p>Cosine similarity of two 12-element vectors. Each element is that region&apos;s calendar-month median count divided by the sum of its 12 monthly medians, within one SP sensor stream.</p></div><div><span>What it cannot establish</span><p>Not common fire causes, land cover, burned area, risk, climate attribution, prediction, sensor harmonization, or statistical significance. Only two curated AOIs are available.</p></div><div><span>Source record</span><p>NASA LANCE FIRMS via the attributed Portolan mirror. Artifact {data.pipelineVersion}, generated {data.generatedAtUtc.slice(0, 10)} UTC.</p></div></section>

    <footer className="analog-footer"><Link href={`/compare?region=punjab&start=${result.baselineStartYear}&end=${result.baselineEndYear}&focus=${stream}`}>Open the independent sensor histories</Link><Link href="/method#sensor-differences">Read sensor limits</Link></footer>
  </main>;
}
