"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import preview from "../../public/data/global-preview.json";

type RegionId = "punjab" | "california";

const regions: Array<{ id: RegionId; label: string }> = [
  { id: "punjab", label: "Punjab, Pakistan" },
  { id: "california", label: "California, USA" },
];

const number = new Intl.NumberFormat("en", { notation: "compact" });

function project(lat: number, lng: number, centerLongitude = 18) {
  const latitude = (lat * Math.PI) / 180;
  const longitude = ((lng - centerLongitude) * Math.PI) / 180;
  const visibility = Math.cos(latitude) * Math.cos(longitude);

  return {
    visible: visibility > 0,
    x: 50 + 46 * Math.cos(latitude) * Math.sin(longitude),
    y: 50 - 46 * Math.sin(latitude),
  };
}

export function HeroExperience() {
  const [periodIndex, setPeriodIndex] = useState(1);
  const [region, setRegion] = useState<RegionId>("punjab");
  const period = preview.periods[periodIndex];

  const points = useMemo(() => {
    const max = Math.max(...period.cells.map((cell) => cell.count));
    return period.cells.slice(0, 420).flatMap((cell) => {
      const position = project(cell.lat, cell.lng);
      if (!position.visible) return [];
      const intensity = Math.log1p(cell.count) / Math.log1p(max);
      return [{ ...cell, ...position, intensity }];
    });
  }, [period]);

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
                <span>Choose a starting region</span>
                <select
                  value={region}
                  onChange={(event) => setRegion(event.target.value as RegionId)}
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
                href={`/explore?region=${region}&year=${period.period.slice(0, 4)}`}
              >
                Explore the atlas
                <span aria-hidden="true">↗</span>
              </Link>
              <Link className="text-action" href="/method#sensor-differences">
                How two satellites see fire differently
              </Link>
            </div>
          </div>

          <div className="globe-stage" aria-label="Raw detection preview">
            <div className="stage-annotation stage-annotation-top">
              <span>Raw detected pixels</span>
              <strong>{number.format(period.globalTotal)}</strong>
              <small>global / {period.period}</small>
            </div>

            <div className="data-globe" aria-hidden="true">
              <div className="globe-grid" />
              <div className="globe-shade" />
              {points.map((point) => (
                <i
                  key={point.id}
                  className="detection-point"
                  style={
                    {
                      left: `${point.x.toFixed(4)}%`,
                      top: `${point.y.toFixed(4)}%`,
                      "--point-scale": (0.42 + point.intensity * 1.1).toFixed(4),
                      "--point-alpha": (0.2 + point.intensity * 0.72).toFixed(4),
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>

            <div className="stage-legend">
              <span><i /> Higher cell count</span>
              <span className="stage-warning">Raw mixed fleet · not harmonized</span>
            </div>
          </div>
        </section>

        <section className="timeline-ribbon" aria-labelledby="time-heading">
          <div className="timeline-intro">
            <p id="time-heading">Select a verified snapshot</p>
            <span>Exact yearly r5 aggregate · top 1,200 cells retained</span>
          </div>
          <div className="period-control" role="group" aria-label="Preview month">
            {preview.periods.map((item, index) => (
              <button
                key={item.period}
                type="button"
                aria-pressed={periodIndex === index}
                onClick={() => setPeriodIndex(index)}
              >
                <span>{item.period.slice(0, 4)}</span>
                <strong>{item.period.slice(5)}</strong>
              </button>
            ))}
          </div>
          <p className="source-note">
            NASA LANCE FIRMS · independent Portolan / Source Cooperative mirror ·
            snapshot checked {period.source.checked_at_utc.slice(0, 10)}
          </p>
        </section>
      </div>
    </main>
  );
}
