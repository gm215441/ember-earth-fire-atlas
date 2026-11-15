"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { CalendarDataset } from "@/lib/calendar-data";
import type { CalibrationReport } from "@/lib/science/calibration-status";
import { seasonalReference } from "@/lib/science/seasonal-reference";

type TourStep = {
  eyebrow: string;
  title: string;
  body: string;
  facts: Array<{ label: string; value: string; detail: string }>;
  href: string;
  action: string;
};

const number = new Intl.NumberFormat("en");
const decimal = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

export function ScienceTour({ initialStep }: { initialStep: number }) {
  const [step, setStep] = useState(initialStep);
  const [calendar, setCalendar] = useState<CalendarDataset | null>(null);
  const [calibration, setCalibration] = useState<CalibrationReport | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/data/regional-calendar-series.json", { signal: controller.signal }).then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<CalendarDataset>; }),
      fetch("/data/calibration-experiment.json", { signal: controller.signal }).then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<CalibrationReport>; }),
    ]).then(([calendarData, calibrationData]) => { setCalendar(calendarData); setCalibration(calibrationData); })
      .catch((reason: unknown) => { if ((reason as { name?: string }).name !== "AbortError") setFailed(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    window.history.replaceState({}, "", `/tour?step=${step + 1}`);
  }, [step]);

  if (failed) return <main className="tour-state"><p className="eyebrow">Guided science tour / unavailable</p><h1>The verified evidence files could not be loaded.</h1><p>The tour will not substitute invented facts.</p><Link href="/method">Read the static method</Link></main>;
  if (!calendar || !calibration) return <main className="tour-state" role="status"><p className="eyebrow">Guided science tour</p><h1>Preparing the evidence trail.</h1><span>Keyboard-first · screen-reader announced · no audio required</span></main>;

  const selectedDate = "2025-04-29";
  const selected = calendar.daily.find((row) => row.region === "punjab" && row.stream === "MODIS" && row.date === selectedDate);
  const reference = seasonalReference(calendar.daily, "punjab", "MODIS", selectedDate);
  const passedGates = calibration.gates.filter((gate) => gate.passed).length;
  const steps: TourStep[] = [
    {
      eyebrow: "01 / Observe",
      title: "Begin with a detection, not a fire.",
      body: "EMBER maps satellite-detected thermal-anomaly pixels. A repeated overpass can detect the same event again, and one event can occupy many pixels. The interface therefore avoids calling a detection a unique fire.",
      facts: [
        { label: "Metric", value: "Detected pixels", detail: "Not unique fire incidents" },
        { label: "Coverage", value: "Positive only", detail: "Missing is not confirmed zero" },
        { label: "Snapshot", value: calendar.generatedAtUtc.slice(0, 10), detail: "Artifact generation date (UTC)" },
      ],
      href: "/",
      action: "Open the dated globe",
    },
    {
      eyebrow: "02 / Name the instrument",
      title: "Keep the sensor histories separate.",
      body: "MODIS and VIIRS differ in spatial response, overpass history, and confidence semantics. EMBER lets each stable SP stream keep its own timeline and never silently relabels mixed raw counts as harmonized.",
      facts: [
        { label: "MODIS stable record", value: `${calendar.streams.MODIS.stableStartYear}-${calendar.period.endYear}`, detail: "Terra + Aqua · SP" },
        { label: "VIIRS stable record", value: `${calendar.streams.VIIRS_SNPP.stableStartYear}-${calendar.period.endYear}`, detail: "Suomi-NPP · SP" },
        { label: "Quality", value: calendar.processing.quality.toUpperCase(), detail: "NRT is not folded into these streams" },
      ],
      href: "/compare",
      action: "Inspect separate histories",
    },
    {
      eyebrow: "03 / Read a day",
      title: "Context comes only from the past.",
      body: "A selected positive-detection date is compared with positive days in the same calendar month from prior stable years. The selected year and all future years are excluded, preventing seasonal-reference leakage.",
      facts: [
        { label: selectedDate, value: selected ? number.format(selected.count) : "Unavailable", detail: "Punjab MODIS detected pixels" },
        { label: "Prior-day percentile", value: reference.status === "ready" ? `${decimal.format(reference.percentile)}th` : "Insufficient", detail: reference.status === "ready" ? `${number.format(reference.sampleCount)} days across ${reference.yearCount} years` : "No score substituted" },
        { label: "Interpretation", value: "Context", detail: "Not forecast, risk, or severity" },
      ],
      href: `/calendar?region=punjab&year=2025&sensor=MODIS&date=${selectedDate}`,
      action: "Open this calendar day",
    },
    {
      eyebrow: "04 / Test the bridge",
      title: "A better fit can still fail release.",
      body: "The held-out calibration experiment improved alignment to the MODIS reference, but only two AOIs were available. Geographic breadth failed, so the result remains unvalidated and no combined truth is published.",
      facts: [
        { label: "Release gates", value: `${passedGates}/${calibration.gates.length} passed`, detail: "Geographic breadth failed" },
        { label: "Validation split", value: calibration.split.validation.join("-"), detail: `${calibration.validationSampleCount} held-out region-months` },
        { label: "Decision", value: "Keep separate", detail: "No validated-index toggle" },
      ],
      href: "/compare#calibration",
      action: "See the held-out experiment",
    },
    {
      eyebrow: "05 / Carry the evidence",
      title: "End with a source-linked sheet.",
      body: "The Fire Season Passport preserves the region, sensor stream, year, and UTC date. Its monthly signature and selected-day statement are computed from the same evidence record and print with the caveats attached.",
      facts: [
        { label: "Formats", value: "A4 + Letter", detail: "One verified page each" },
        { label: "Selected state", value: "Punjab · 2025", detail: "MODIS · 2025-04-29 UTC" },
        { label: "Sources", value: "FIRMS + mirror", detail: "Methods and limits included" },
      ],
      href: `/passport?region=punjab&year=2025&sensor=MODIS&date=${selectedDate}`,
      action: "Generate the evidence sheet",
    },
  ];
  const active = steps[step];
  const changeStep = (next: number) => setStep(Math.max(0, Math.min(steps.length - 1, next)));

  return <main className="tour-shell" onKeyDown={(event) => { if (event.key === "ArrowLeft") changeStep(step - 1); if (event.key === "ArrowRight") changeStep(step + 1); }}>
    <a className="tour-skip" href="#tour-content">Skip tour navigation</a>
    <header className="tour-header"><Link className="brand-lockup" href="/"><span className="brand-mark">E</span><span><strong>EMBER</strong><small>Guided science tour</small></span></Link><nav aria-label="Tour navigation"><Link href="/analogs">Seasonal analogs</Link><Link href="/method">Full method</Link></nav></header>

    <div className="tour-layout">
      <aside aria-label="Tour progress"><span>Evidence trail</span><ol>{steps.map((item, index) => <li key={item.title}><button type="button" aria-current={step === index ? "step" : undefined} onClick={() => changeStep(index)}><i>{String(index + 1).padStart(2, "0")}</i><span>{item.title}</span></button></li>)}</ol><p>Use the buttons or left/right arrow keys. No voice or timed interaction is required.</p></aside>
      <section id="tour-content" className="tour-content" aria-live="polite" aria-atomic="true">
        <div className="tour-step-count"><span>Step {step + 1}</span><i><b style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></i><span>{steps.length}</span></div>
        <p className="eyebrow">{active.eyebrow}</p>
        <h1>{active.title}</h1>
        <p className="tour-body">{active.body}</p>
        <div className="tour-facts">{active.facts.map((fact) => <div key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong><small>{fact.detail}</small></div>)}</div>
        <div className="tour-actions"><div><button type="button" onClick={() => changeStep(step - 1)} disabled={step === 0}>Previous</button><button type="button" onClick={() => changeStep(step + 1)} disabled={step === steps.length - 1}>Next</button></div><Link href={active.href}>{active.action} ↗</Link></div>
      </section>
    </div>
    <footer className="tour-footer"><span>NASA LANCE FIRMS · Portolan mirror · UTC</span><p>A detection is not a unique fire. FRP is not burned area. Positive-only data cannot prove no-fire coverage.</p></footer>
  </main>;
}
