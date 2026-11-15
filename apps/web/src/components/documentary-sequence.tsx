"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useRef, useState } from "react";

import preview from "../../public/data/global-preview.json";
import storyRegions from "../../public/data/story-regions.json";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const scenes = ["The archive", "Seasonal comparison", "Sensor vocabulary", "Regional evidence"];
type RegionId = keyof typeof storyRegions.regions;
type PreviewCell = (typeof preview.periods)[number]["cells"][number];
const compactNumber = new Intl.NumberFormat("en", { notation: "compact" });

function project(cell: PreviewCell, centerLongitude = 18) {
  const latitude = (cell.lat * Math.PI) / 180;
  const longitude = ((cell.lng - centerLongitude) * Math.PI) / 180;
  const visibility = Math.cos(latitude) * Math.cos(longitude);
  return {
    visible: visibility > 0,
    x: 50 + 45 * Math.cos(latitude) * Math.sin(longitude),
    y: 50 - 45 * Math.sin(latitude),
  };
}

function Hemisphere({ periodIndex, limit, className = "" }: { periodIndex: number; limit: number; className?: string }) {
  const period = preview.periods[periodIndex];
  const cells = period.cells.slice(0, limit);
  const max = Math.max(...cells.map((cell) => cell.count), 1);
  return (
    <div className={`story-hemisphere ${className}`} aria-hidden="true">
      <span className="story-hemisphere-grid" /><span className="story-hemisphere-shade" />
      {cells.flatMap((cell) => {
        const position = project(cell);
        if (!position.visible) return [];
        const intensity = Math.log1p(cell.count) / Math.log1p(max);
        return [<i key={cell.id} style={{ left: `${position.x.toFixed(4)}%`, top: `${position.y.toFixed(4)}%`, "--story-point-size": `${(2.2 + intensity * 3.8).toFixed(4)}px`, "--story-point-alpha": (0.2 + intensity * 0.76).toFixed(4) } as React.CSSProperties} />];
      })}
    </div>
  );
}

function ArchivePlate({ periodIndex }: { periodIndex: number }) {
  const period = preview.periods[periodIndex];
  return (
    <div className="story-plate story-plate-archive">
      <div className="story-archive-years" aria-hidden="true"><span>2000</span><span>2005</span><span>2010</span><span>2015</span><span>2020</span><strong>2025</strong></div>
      <Hemisphere periodIndex={periodIndex} limit={260} />
      <div className="story-plate-readout"><span>Selected archive frame</span><strong>{period.period}</strong><small>{compactNumber.format(period.globalTotal)} raw detected pixels</small></div>
      <p className="story-plate-caption">One point field · time, sensor and provenance retained</p>
    </div>
  );
}

function SeasonsPlate() {
  return (
    <div className="story-plate story-plate-seasons">
      {preview.periods.map((period, index) => (
        <div className="story-season-frame" key={period.period}>
          <Hemisphere periodIndex={index} limit={180} />
          <div><span>{period.period}</span><strong>{compactNumber.format(period.globalTotal)}</strong><small>raw mixed-fleet pixels</small></div>
        </div>
      ))}
      <div className="story-season-axis" aria-hidden="true"><span>Jan</span><i /><span>Aug</span></div>
      <p className="story-plate-caption">Different source years · spatial comparison only · not a trend line</p>
    </div>
  );
}

function SensorsPlate() {
  return (
    <div className="story-plate story-plate-sensors">
      <div className="sensor-column sensor-column-modis">
        <header><span>01</span><strong>MODIS</strong><small>Terra + Aqua</small></header>
        <div className="sensor-swath" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="confidence-scale"><span>Native confidence</span><div><i /><i /><i /><i /><i /><i /></div><strong>0—100%</strong></div>
      </div>
      <div className="sensor-column sensor-column-viirs">
        <header><span>02</span><strong>VIIRS</strong><small>Suomi-NPP + NOAA</small></header>
        <div className="sensor-swath" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className="confidence-categories"><span>Native confidence</span><div><b>L</b><b>N</b><b>H</b></div><strong>low · nominal · high</strong></div>
      </div>
      <div className="sensor-divider" aria-hidden="true"><span>≠</span></div>
      <p className="story-plate-caption">Native vocabularies stay separate · no silent conversion</p>
    </div>
  );
}

function RegionPlate({ region }: { region: RegionId }) {
  const selected = storyRegions.regions[region];
  const [west, south, east, north] = selected.bounds;
  return (
    <div className="story-plate story-plate-region">
      <div className="region-coordinate-field" aria-hidden="true">
        <span className="region-grid" />
        {selected.points.map((point, index) => (
          <i key={`${point.acquiredUtc}-${index}`} className={point.sensor === "MODIS" ? "is-modis" : "is-viirs"} style={{ left: `${(((point.longitude - west) / (east - west)) * 100).toFixed(4)}%`, top: `${(100 - ((point.latitude - south) / (north - south)) * 100).toFixed(4)}%` }} />
        ))}
        <b className="region-corner region-corner-nw">{north.toFixed(2)}°N</b><b className="region-corner region-corner-se">{east.toFixed(2)}°E</b>
      </div>
      <div className="region-plate-meta"><span>2025 rectangular analysis extent</span><strong>{selected.label}</strong><small>{selected.fullObservationCount.toLocaleString("en")} source rows</small><div><i /> MODIS <i /> VIIRS</div></div>
      <p className="story-plate-caption">Real FIRMS rows · display subset shown · bounding box, not polygon clip</p>
    </div>
  );
}

function StoryPlate({ scene, periodIndex, region }: { scene: number; periodIndex: number; region: RegionId }) {
  if (scene === 0) return <ArchivePlate periodIndex={periodIndex} />;
  if (scene === 1) return <SeasonsPlate />;
  if (scene === 2) return <SensorsPlate />;
  return <RegionPlate region={region} />;
}

export function DocumentarySequence() {
  const rootRef = useRef<HTMLElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);
  const [periodIndex, setPeriodIndex] = useState(1);
  const [periodLocked, setPeriodLocked] = useState(false);
  const [region, setRegion] = useState<RegionId>("punjab");

  useGSAP(() => {
    const root = rootRef.current;
    if (!root) return;
    root.removeAttribute("data-enhanced");
    if (motionPaused) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      root.dataset.enhanced = "true";
      const panels = gsap.utils.toArray<HTMLElement>(".documentary-panel");
      const plates = gsap.utils.toArray<HTMLElement>(".documentary-visual > .story-plate");
      gsap.set(panels, { autoAlpha: 0, y: 28 });
      gsap.set(plates, { autoAlpha: 0, scale: 0.975, y: 16 });
      gsap.set([panels[0], plates[0]], { autoAlpha: 1, scale: 1, y: 0 });
      let visibleIndex = 0;
      const activate = (index: number) => {
        if (index === visibleIndex) return;
        const previousIndex = visibleIndex;
        visibleIndex = index;
        setActiveScene(index);
        if (!periodLocked) setPeriodIndex(index === 1 ? 0 : 1);
        const outgoing = [panels[previousIndex], plates[previousIndex]];
        const incoming = [panels[index], plates[index]];
        gsap.killTweensOf([...panels, ...plates]);
        gsap.set(panels[index], { autoAlpha: 0, y: 22 });
        gsap.set(plates[index], { autoAlpha: 0, scale: 0.985, y: 18 });
        gsap.timeline()
          .to(outgoing, { autoAlpha: 0, duration: 0.28, ease: "power2.inOut" }, 0)
          .to(panels[previousIndex], { y: -12, duration: 0.32, ease: "power2.inOut" }, 0)
          .to(plates[previousIndex], { y: -10, scale: 1.012, duration: 0.32, ease: "power2.inOut" }, 0)
          .to(incoming, { autoAlpha: 1, duration: 0.62, ease: "power3.out" }, 0.08)
          .to(panels[index], { y: 0, duration: 0.62, ease: "power3.out" }, 0.08)
          .to(plates[index], { y: 0, scale: 1, duration: 0.62, ease: "power3.out" }, 0.08);
      };
      const storyTrigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => activate(Math.min(scenes.length - 1, Math.round(self.progress * (scenes.length - 1)))),
        snap: {
          snapTo: (progress) => Math.round(progress * (scenes.length - 1)) / (scenes.length - 1),
          duration: { min: 0.22, max: 0.52 },
          delay: 0.06,
          ease: "power2.inOut",
        },
      });
      let wheelLocked = false;
      let wheelUnlockTimer = 0;
      const onWheel = (event: WheelEvent) => {
        if (event.ctrlKey || Math.abs(event.deltaY) < 16) return;
        const direction = event.deltaY > 0 ? 1 : -1;
        const atBoundary = (visibleIndex === 0 && direction < 0) || (visibleIndex === scenes.length - 1 && direction > 0);
        if (atBoundary) return;
        event.preventDefault();
        if (wheelLocked) return;
        wheelLocked = true;
        const targetIndex = Math.max(0, Math.min(scenes.length - 1, visibleIndex + direction));
        const rootTop = root.getBoundingClientRect().top + window.scrollY;
        const scrollRange = root.offsetHeight - window.innerHeight;
        window.scrollTo({
          top: rootTop + (scrollRange * targetIndex) / (scenes.length - 1),
          behavior: "smooth",
        });
        wheelUnlockTimer = window.setTimeout(() => { wheelLocked = false; }, 720);
      };
      root.addEventListener("wheel", onWheel, { passive: false });
      ScrollTrigger.refresh();
      return () => {
        window.clearTimeout(wheelUnlockTimer);
        root.removeEventListener("wheel", onWheel);
        storyTrigger.kill();
        root.removeAttribute("data-enhanced");
      };
    });
    return () => media.revert();
  }, { scope: rootRef, dependencies: [motionPaused, periodLocked], revertOnUpdate: true });

  const selectPeriod = (index: number) => { setPeriodLocked(true); setPeriodIndex(index); };
  const goToScene = (index: number) => {
    const root = rootRef.current;
    const enhanced = root?.dataset.enhanced === "true";
    if (root && enhanced) {
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const scrollRange = root.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: rootTop + (scrollRange * index) / (scenes.length - 1),
        behavior: "auto",
      });
      return;
    }
    setActiveScene(index);
    root?.querySelector<HTMLElement>(`[data-documentary-panel="${index}"]`)?.scrollIntoView({ behavior: motionPaused ? "auto" : "smooth", block: "start" });
  };

  return (
    <section ref={rootRef} className="documentary" aria-labelledby="documentary-heading" data-active-scene={activeScene} data-motion-paused={motionPaused} data-period={preview.periods[periodIndex].period}>
      <a className="documentary-skip" href="#documentary-end">Skip documentary sequence</a>
      <div className="documentary-sticky">
        <header className="documentary-header"><div><span>EMBER / FIELD NOTES 01</span><strong>Reading a changing record</strong></div><button type="button" aria-pressed={motionPaused} onClick={() => setMotionPaused((value) => !value)}>{motionPaused ? "Resume motion" : "Pause motion"}</button></header>
        <div className="documentary-grid">
          <div className="documentary-copy">
            <article className="documentary-panel" data-documentary-panel="0" tabIndex={-1}>
              <p className="eyebrow">Scene 01 / the archive</p><h2 id="documentary-heading">A record made of moments.</h2><p>Each mark is a detected thermal-anomaly pixel tied to a time and instrument—not a unique fire, not burned area.</p>
              <div className="documentary-periods" role="group" aria-label="Documentary month">{preview.periods.map((item, index) => <button key={item.period} type="button" aria-pressed={periodIndex === index} onClick={() => selectPeriod(index)}>{item.period}</button>)}</div>
              <div className="mobile-story-plate"><StoryPlate scene={0} periodIndex={periodIndex} region={region} /></div>
            </article>
            <article className="documentary-panel" data-documentary-panel="1" tabIndex={-1}>
              <p className="eyebrow">Scene 02 / seasonal geography</p><h2>The pattern moves before the number does.</h2><p>January 2020 and August 2025 put activity in different parts of the globe. They are separate source snapshots, not a calibrated change estimate.</p>
              <div className="mobile-story-plate"><StoryPlate scene={1} periodIndex={periodIndex} region={region} /></div>
            </article>
            <article className="documentary-panel" data-documentary-panel="2" tabIndex={-1}>
              <p className="eyebrow">Scene 03 / instrument language</p><h2>Different eyes. Different vocabularies.</h2><p>MODIS confidence is numeric. VIIRS uses low, nominal, and high categories. EMBER keeps those native meanings visible instead of forcing a false conversion.</p><a href="https://disasters.nasa.gov/sites/default/files/2023-03/D1P5_FireDetection_Final.pdf" target="_blank" rel="noreferrer">NASA ARSET instrument reference ↗</a>
              <div className="mobile-story-plate"><StoryPlate scene={2} periodIndex={periodIndex} region={region} /></div>
            </article>
            <article className="documentary-panel" data-documentary-panel="3" tabIndex={-1}>
              <p className="eyebrow">Scene 04 / regional evidence</p><h2>A place turns pixels into questions.</h2><p>Choose a verified analysis extent. The next view carries its date, coordinates, sensor, source quality, and limitations forward.</p>
              <div className="documentary-region" role="group" aria-label="Story region">{(Object.keys(storyRegions.regions) as RegionId[]).map((id) => <button key={id} type="button" aria-pressed={region === id} onClick={() => setRegion(id)}>{storyRegions.regions[id].label}</button>)}</div>
              <Link href={`/explore?region=${region}&start=2025-01-01&end=2025-12-31`}>Continue to regional evidence ↗</Link><div className="mobile-story-plate"><StoryPlate scene={3} periodIndex={periodIndex} region={region} /></div>
            </article>
          </div>
          <div className="documentary-visual" aria-label="Four-part real-data documentary">{[0, 1, 2, 3].map((scene) => <StoryPlate key={scene} scene={scene} periodIndex={periodIndex} region={region} />)}</div>
        </div>
        <nav className="documentary-navigation" aria-label="Documentary scenes"><span aria-live="polite">0{activeScene + 1} / 04</span><strong>{scenes[activeScene]}</strong><div>{scenes.map((scene, index) => <button key={scene} type="button" aria-label={`Go to scene ${index + 1}: ${scene}`} aria-pressed={activeScene === index} onClick={() => goToScene(index)} />)}</div></nav>
      </div>
      <div className="documentary-markers" aria-hidden="true">{scenes.map((scene, index) => <div className="documentary-marker" data-documentary-marker={index} key={scene} />)}</div>
      <div className="documentary-end" id="documentary-end" aria-label="End of documentary sequence" tabIndex={-1} />
    </section>
  );
}
