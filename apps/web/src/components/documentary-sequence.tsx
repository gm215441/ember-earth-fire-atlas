"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import preview from "../../public/data/global-preview.json";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const scenes = [
  "A history written in detected pixels",
  "Seasonal pulses move around Earth",
  "MODIS and VIIRS see differently",
  "Evidence begins with a place",
];

const regions = {
  punjab: { label: "Punjab, Pakistan", lat: 31.2, lng: 72.4 },
  california: { label: "California, USA", lat: 37.2, lng: -119.6 },
} as const;

type RegionId = keyof typeof regions;

const compactNumber = new Intl.NumberFormat("en", { notation: "compact" });

function project(lat: number, lng: number, centerLongitude: number) {
  const latitude = (lat * Math.PI) / 180;
  const longitude = ((lng - centerLongitude) * Math.PI) / 180;
  const visibility = Math.cos(latitude) * Math.cos(longitude);

  return {
    visible: visibility > 0,
    x: 50 + 46 * Math.cos(latitude) * Math.sin(longitude),
    y: 50 - 46 * Math.sin(latitude),
  };
}

export function DocumentarySequence() {
  const rootRef = useRef<HTMLElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);
  const [periodIndex, setPeriodIndex] = useState(1);
  const [periodLocked, setPeriodLocked] = useState(false);
  const [region, setRegion] = useState<RegionId>("punjab");
  const period = preview.periods[periodIndex];
  const selectedRegion = regions[region];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      root.removeAttribute("data-enhanced");

      if (motionPaused) {
        gsap.set([".documentary-panel", ".documentary-globe"], {
          clearProps: "all",
        });
        return;
      }

      const media = gsap.matchMedia();
      media.add(
        "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
        () => {
          root.dataset.enhanced = "true";
          const panels = gsap.utils.toArray<HTMLElement>(".documentary-panel");
          const markers = gsap.utils.toArray<HTMLElement>(".documentary-marker");
          const globe = root.querySelector<HTMLElement>(".documentary-globe");

          gsap.set(panels, { autoAlpha: 0, y: 34 });
          gsap.set(panels[0], { autoAlpha: 1, y: 0 });

          const activate = (index: number) => {
            setActiveScene(index);
            if (!periodLocked) setPeriodIndex(index === 1 ? 0 : 1);

            gsap.to(panels, {
              autoAlpha: 0,
              duration: 0.25,
              overwrite: true,
              y: -18,
            });
            gsap.to(panels[index], {
              autoAlpha: 1,
              duration: 0.58,
              ease: "power3.out",
              overwrite: true,
              y: 0,
            });

            const camera = [
              { scale: 0.94, xPercent: 0, yPercent: 0 },
              { scale: 1.02, xPercent: -2, yPercent: 1 },
              { scale: 1.12, xPercent: -5, yPercent: 2 },
              { scale: 1.34, xPercent: -12, yPercent: 5 },
            ][index];
            if (globe) {
              gsap.to(globe, {
                ...camera,
                duration: 1.05,
                ease: "power2.inOut",
                overwrite: true,
              });
            }
          };

          const triggers = markers.map((marker, index) =>
            ScrollTrigger.create({
              trigger: marker,
              start: "top center",
              end: "bottom center",
              onEnter: () => activate(index),
              onEnterBack: () => activate(index),
            }),
          );

          ScrollTrigger.refresh();
          return () => {
            triggers.forEach((trigger) => trigger.kill());
            root.removeAttribute("data-enhanced");
          };
        },
      );

      return () => media.revert();
    },
    {
      scope: rootRef,
      dependencies: [motionPaused, periodLocked],
      revertOnUpdate: true,
    },
  );

  const centerLongitude = activeScene === 3 ? selectedRegion.lng : 18;
  const points = useMemo(() => {
    const max = Math.max(...period.cells.map((cell) => cell.count), 1);
    return period.cells.slice(0, 520).flatMap((cell) => {
      const position = project(cell.lat, cell.lng, centerLongitude);
      if (!position.visible) return [];
      const intensity = Math.log1p(cell.count) / Math.log1p(max);
      return [{ ...cell, ...position, intensity }];
    });
  }, [centerLongitude, period]);

  const selectPeriod = (index: number) => {
    setPeriodLocked(true);
    setPeriodIndex(index);
  };

  const goToScene = (index: number) => {
    const root = rootRef.current;
    const selector =
      root?.dataset.enhanced === "true"
        ? `[data-documentary-marker="${index}"]`
        : `[data-documentary-panel="${index}"]`;
    const target = selector
      ? root?.querySelector<HTMLElement>(selector)
      : undefined;
    setActiveScene(index);
    target?.scrollIntoView({
      behavior: motionPaused ? "auto" : "smooth",
      block: root?.dataset.enhanced === "true" ? "center" : "start",
    });
  };

  return (
    <section
      ref={rootRef}
      className="documentary"
      aria-labelledby="documentary-heading"
      data-active-scene={activeScene}
      data-motion-paused={motionPaused}
    >
      <a className="documentary-skip" href="#documentary-end">
        Skip documentary sequence
      </a>

      <div className="documentary-sticky">
        <header className="documentary-header">
          <div>
            <span>EMBER / FIELD NOTES 01</span>
            <strong>Reading a changing record</strong>
          </div>
          <button
            type="button"
            aria-pressed={motionPaused}
            onClick={() => setMotionPaused((current) => !current)}
          >
            {motionPaused ? "Resume motion" : "Pause motion"}
          </button>
        </header>

        <div className="documentary-grid">
          <div className="documentary-copy">
            <article
              className="documentary-panel"
              data-documentary-panel="0"
              tabIndex={-1}
            >
              <p className="eyebrow">Scene 01 / a long record</p>
              <h2 id="documentary-heading">A history written in detected pixels.</h2>
              <p>
                Satellite instruments record thermal-anomaly pixels, not unique
                fires. The archive becomes legible only when place, time, sensor,
                and observation quality stay attached.
              </p>
            </article>

            <article
              className="documentary-panel"
              data-documentary-panel="1"
              tabIndex={-1}
            >
              <p className="eyebrow">Scene 02 / seasonal pulse</p>
              <h2>Fire activity moves with the seasons.</h2>
              <p>
                January 2020 and August 2025 put different clusters in view.
                These snapshots describe spatial pulses in raw detections—not a
                harmonized change in global fire.
              </p>
              <p className="documentary-fact">
                January 2020 · 4.1M raw pixels<br />
                August 2025 · 8.4M raw pixels
              </p>
            </article>

            <article
              className="documentary-panel"
              data-documentary-panel="2"
              tabIndex={-1}
            >
              <p className="eyebrow">Scene 03 / different sight</p>
              <h2>Two instruments can count differently.</h2>
              <p>
                MODIS launched with Terra in 1999 and Aqua in 2002. VIIRS followed
                on Suomi NPP in 2011 and NOAA-20 in 2017. Their spatial sampling,
                overpasses, and detection behavior differ, so their raw counts
                cannot be treated as one trend.
              </p>
              <a
                href="https://disasters.nasa.gov/sites/default/files/2023-03/D1P5_FireDetection_Final.pdf"
                target="_blank"
                rel="noreferrer"
              >
                NASA ARSET instrument reference ↗
              </a>
            </article>

            <article
              className="documentary-panel"
              data-documentary-panel="3"
              tabIndex={-1}
            >
              <p className="eyebrow">Scene 04 / geographic evidence</p>
              <h2>Evidence begins with a place.</h2>
              <p>
                Focus the lens on a case-study region, then carry its date,
                coordinates, source, and limitations into the atlas.
              </p>
              <div className="documentary-region" role="group" aria-label="Story region">
                {(Object.keys(regions) as RegionId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={region === id}
                    onClick={() => setRegion(id)}
                  >
                    {regions[id].label}
                  </button>
                ))}
              </div>
              <Link href={`/explore?region=${region}&year=${period.period.slice(0, 4)}`}>
                Continue to regional evidence ↗
              </Link>
            </article>
          </div>

          <div className="documentary-visual" aria-label="Real-data documentary globe">
            <div className="documentary-globe" aria-hidden="true">
              <span className="documentary-gridlines" />
              <span className="documentary-shade" />
              {points.map((point) => (
                <i
                  key={point.id}
                  style={
                    {
                      left: `${point.x.toFixed(4)}%`,
                      top: `${point.y.toFixed(4)}%`,
                      "--documentary-point-scale": (
                        0.4 +
                        point.intensity * 1.1
                      ).toFixed(4),
                      "--documentary-point-alpha": (
                        0.18 +
                        point.intensity * 0.76
                      ).toFixed(4),
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>

            <div className="documentary-readout">
              <span>Raw detected pixels / {period.period}</span>
              <strong>{compactNumber.format(period.globalTotal)}</strong>
              {activeScene === 3 ? <small>{selectedRegion.label} focus</small> : null}
            </div>

            <div className="documentary-periods" role="group" aria-label="Documentary month">
              {preview.periods.map((item, index) => (
                <button
                  key={item.period}
                  type="button"
                  aria-pressed={periodIndex === index}
                  onClick={() => selectPeriod(index)}
                >
                  {item.period}
                </button>
              ))}
            </div>

            <p className="documentary-warning">
              Raw mixed fleet · not harmonized · manual month selection stays fixed
              while scrolling
            </p>
          </div>
        </div>

        <nav className="documentary-navigation" aria-label="Documentary scenes">
          <span aria-live="polite">Scene {activeScene + 1} / 4</span>
          <div>
            {scenes.map((scene, index) => (
              <button
                key={scene}
                type="button"
                aria-label={`Go to scene ${index + 1}: ${scene}`}
                aria-pressed={activeScene === index}
                onClick={() => goToScene(index)}
              />
            ))}
          </div>
        </nav>
      </div>

      <div className="documentary-markers" aria-hidden="true">
        {scenes.map((scene, index) => (
          <div
            className="documentary-marker"
            data-documentary-marker={index}
            key={scene}
          />
        ))}
      </div>

      <div
        className="documentary-end"
        id="documentary-end"
        aria-label="End of documentary sequence"
        tabIndex={-1}
      />
    </section>
  );
}
