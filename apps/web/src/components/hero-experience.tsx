"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import preview from "../../public/data/global-preview.json";
import { DocumentarySequence } from "./documentary-sequence";
import { GlobeScene } from "./globe-scene";

type RegionId = "punjab" | "california";
type TimelineState = "idle" | "scrubbing" | "playing" | "paused";
type Selection = { lat: number; lng: number; label: string };

const regions: Array<{
  id: RegionId;
  label: string;
  lat: number;
  lng: number;
}> = [
  { id: "punjab", label: "Punjab, Pakistan", lat: 31.2, lng: 72.4 },
  { id: "california", label: "California, USA", lat: 37.2, lng: -119.6 },
];

const compactNumber = new Intl.NumberFormat("en", { notation: "compact" });
const coordinate = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });

function coordinateLabel(lat: number, lng: number) {
  return `${coordinate.format(Math.abs(lat))}°${lat >= 0 ? "N" : "S"}, ${coordinate.format(Math.abs(lng))}°${lng >= 0 ? "E" : "W"}`;
}
export function HeroExperience() {
  const [periodIndex, setPeriodIndex] = useState(1);
  const [region, setRegion] = useState<RegionId>("punjab");
  const [timelineState, setTimelineState] = useState<TimelineState>("idle");
  const [selection, setSelection] = useState<Selection | null>(null);
  const period = preview.periods[periodIndex];

  useEffect(() => {
    if (timelineState !== "playing") return;
    const timer = window.setInterval(() => {
      setPeriodIndex((current) => (current + 1) % preview.periods.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [timelineState]);

  const choosePeriod = (index: number) => {
    setTimelineState("scrubbing");
    setPeriodIndex(index);
    window.requestAnimationFrame(() => setTimelineState("idle"));
  };

  const chooseRegion = (id: RegionId) => {
    const next = regions.find((item) => item.id === id) ?? regions[0];
    setRegion(id);
    setSelection({ lat: next.lat, lng: next.lng, label: next.label });
  };

  const handleGlobeSelect = useCallback((coords: { lat: number; lng: number }) => {
    setSelection({
      ...coords,
      label: `Selected coordinate · ${coordinateLabel(coords.lat, coords.lng)}`,
    });
  }, []);

  const stopPlayback = useCallback(() => {
    setTimelineState((current) =>
      current === "playing" ? "paused" : current,
    );
  }, []);

  return (
    <main className="hero-shell">
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-frame">
        <header className="site-header">
          <Link className="brand-lockup" href="/" aria-label="EMBER home">
            <span className="brand-mark">E</span>
            <span>
              <strong>EMBER</strong>
              <small>Earth Fire Atlas</small>
            </span>
          </Link>
          <nav aria-label="Primary navigation">
            <Link href="/explore">Explore</Link>
            <Link href="/calendar">Calendar</Link>
            <Link href="/compare">Compare</Link>
            <Link href="/method">Methodology</Link>
          </nav>
        </header>

        <section className="hero-grid" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Twenty-five years of Earth&apos;s fire record</p>
            <h1 id="hero-title">Every place has a history of burning.</h1>
            <p className="hero-deck">
              Explore the seasons, signals, and uncertainty in
              satellite-detected activity.
            </p>

            <div className="hero-actions">
              <label className="region-field">
                <span>Accessible region focus</span>
                <select
                  value={region}
                  onChange={(event) => chooseRegion(event.target.value as RegionId)}
                >
                  {regions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <Link
                className="primary-action"
                href={
                  selection
                    ? `/explore?lat=${selection.lat.toFixed(4)}&lng=${selection.lng.toFixed(4)}&year=${period.period.slice(0, 4)}`
                    : `/explore?region=${region}&year=${period.period.slice(0, 4)}`
                }
              >
                Explore the atlas
                <span aria-hidden="true">↗</span>
              </Link>
              <Link className="text-action" href="/method#sensor-differences">
                How two satellites see fire differently
              </Link>
            </div>
          </div>

          <div className="globe-stage" aria-label="Interactive raw detection globe">
            <GlobeScene
              cells={period.cells}
              period={period.period}
              selection={selection}
              onSelect={handleGlobeSelect}
              onInteraction={stopPlayback}
            />

            <div className="stage-annotation stage-annotation-top">
              <span>Raw detected pixels</span>
              <strong>{compactNumber.format(period.globalTotal)}</strong>
              <small>global / {period.period}</small>
            </div>

            {selection ? (
              <div className="globe-selection" data-testid="globe-selection" role="status">
                <span>Focused location</span>
                <strong>{selection.label}</strong>
                <small>{coordinateLabel(selection.lat, selection.lng)}</small>
              </div>
            ) : null}

            <div className="stage-legend">
              <span><i /> Higher cell count</span>
              <span className="stage-warning">Raw mixed fleet · not harmonized</span>
              <span className="texture-credit">Earth texture: NASA/GSFC SVS · Reto Stöckli</span>
            </div>
          </div>
        </section>

        <section
          className="timeline-ribbon"
          aria-labelledby="time-heading"
          data-timeline-state={timelineState}
        >
          <div className="timeline-intro">
            <p id="time-heading">Select a verified snapshot</p>
            <span>Exact yearly r5 aggregate · top 1,200 cells retained</span>
          </div>
          <div className="period-cluster">
            <button
              className="playback-button"
              type="button"
              aria-label={timelineState === "playing" ? "Pause timeline" : "Play timeline"}
              aria-pressed={timelineState === "playing"}
              onClick={() =>
                setTimelineState((current) =>
                  current === "playing" ? "paused" : "playing",
                )
              }
            >
              {timelineState === "playing" ? "Ⅱ" : "▶"}
            </button>
            <div className="period-control" role="group" aria-label="Preview month">
              {preview.periods.map((item, index) => (
                <button
                  key={item.period}
                  type="button"
                  aria-label={`${item.period.slice(0, 4)} ${item.period.slice(5)}`}
                  aria-pressed={periodIndex === index}
                  onClick={() => choosePeriod(index)}
                >
                  <span>{item.period.slice(0, 4)}</span>
                  <strong>{item.period.slice(5)}</strong>
                </button>
              ))}
            </div>
          </div>
          <p className="source-note">
            NASA LANCE FIRMS · independent Portolan / Source Cooperative mirror ·
            snapshot checked {period.source.checked_at_utc.slice(0, 10)}
          </p>
        </section>
      </div>
      <DocumentarySequence />
    </main>
  );
}
