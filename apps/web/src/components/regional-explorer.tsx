"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { withBasePath } from "@/lib/base-path";

import {
  confidenceLabel,
  sensorMatches,
  type DailyCount,
  type ExplorerFilters,
  type RegionalDataset,
  type RegionalObservation,
  type RegionId,
} from "@/lib/regional-data";

const RegionalMap = dynamic(() => import("./regional-map").then((module) => module.RegionalMap), {
  ssr: false,
  loading: () => <div className="regional-map map-module-loading" role="status">Preparing map engine…</div>,
});

type ViewState = { longitude: number; latitude: number; zoom: number };

const platformOptions = ["all", "Aqua", "Terra", "Suomi-NPP", "NOAA-20", "NOAA-21"];

function rowMatches(row: RegionalObservation | DailyCount, filters: ExplorerFilters) {
  const date = "acquiredUtc" in row ? row.acquiredUtc.slice(0, 10) : row.date;
  return date >= filters.start && date <= filters.end
    && sensorMatches(row.sensor, filters.sensor)
    && (filters.platform === "all" || row.satellite === filters.platform)
    && (filters.quality === "all" || row.quality === filters.quality)
    && (filters.dayNight === "all" || row.dayNight === filters.dayNight);
}

function csvCell(value: string | number | null) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function RegionalExplorer({
  initialFilters,
  initialView,
}: {
  initialFilters: ExplorerFilters;
  initialView?: ViewState;
}) {
  const [dataset, setDataset] = useState<RegionalDataset | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [view, setView] = useState<ViewState | null>(initialView ?? null);
  const [selected, setSelected] = useState<RegionalObservation | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(withBasePath("/data/regional-2025.json"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<RegionalDataset>;
      })
      .then(setDataset)
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") {
          setLoadError("The verified regional snapshot could not be loaded. No substitute data was inserted.");
        }
      });
    return () => controller.abort();
  }, [loadAttempt]);

  const region = dataset?.regions[filters.region] ?? null;
  const mapView = view ?? (region ? { longitude: region.center[0], latitude: region.center[1], zoom: region.zoom } : { longitude: 72.35, latitude: 31, zoom: 5.7 });

  const observations = useMemo(
    () => region?.observations.filter((row) => rowMatches(row, filters)) ?? [],
    [filters, region],
  );
  const fullCount = useMemo(
    () => region?.dailyCounts.filter((row) => rowMatches(row, filters)).reduce((sum, row) => sum + row.count, 0) ?? 0,
    [filters, region],
  );
  const activeSelected = selected && observations.some((row) => row.id === selected.id) ? selected : null;

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("region", filters.region);
    params.set("start", filters.start);
    params.set("end", filters.end);
    if (filters.sensor !== "all") params.set("sensor", filters.sensor);
    if (filters.platform !== "all") params.set("platform", filters.platform);
    if (filters.quality !== "all") params.set("quality", filters.quality);
    if (filters.dayNight !== "all") params.set("daynight", filters.dayNight);
    if (view) {
      params.set("lng", view.longitude.toFixed(4));
      params.set("lat", view.latitude.toFixed(4));
      params.set("zoom", view.zoom.toFixed(2));
    }
    window.history.replaceState({}, "", `/explore?${params.toString()}`);
  }, [filters, view]);

  const updateFilter = <Key extends keyof ExplorerFilters>(key: Key, value: ExplorerFilters[Key]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const chooseRegion = (regionId: RegionId) => {
    const target = dataset?.regions[regionId];
    setFilters((current) => ({ ...current, region: regionId }));
    setSelected(null);
    if (target) setView({ longitude: target.center[0], latitude: target.center[1], zoom: target.zoom });
  };

  const handleViewChange = useCallback((next: ViewState) => setView(next), []);

  const download = () => {
    const headers = ["acquired_utc", "latitude", "longitude", "sensor", "satellite", "quality", "day_night", "confidence_native", "frp_mw", "source_type_code"];
    const rows = observations.map((row) => [row.acquiredUtc, row.latitude, row.longitude, row.sensor, row.satellite, row.quality, row.dayNight, row.confidence, row.frpMw, row.sourceType]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ember-${filters.region}-${filters.start}-${filters.end}-display-sample.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!dataset && !loadError) {
    return <main className="explorer-state" role="status"><i /><p className="eyebrow">Regional evidence</p><h1>Loading the verified observation snapshot.</h1><span>Exact source rows · no fallback fixtures</span></main>;
  }

  if (loadError || !dataset || !region) {
    return <main className="explorer-state explorer-error"><p className="eyebrow">Regional evidence / load error</p><h1>The observation record is unavailable.</h1><p>{loadError}</p><button type="button" onClick={() => { setLoadError(null); setLoadAttempt((value) => value + 1); }}>Retry verified snapshot</button><Link href="/">Return to globe</Link></main>;
  }

  return (
    <main className="explorer-shell">
      <header className="explorer-header">
        <Link className="brand-lockup" href="/" aria-label="EMBER home"><span className="brand-mark">E</span><span><strong>EMBER</strong><small>Regional evidence</small></span></Link>
        <div><span>2025 source snapshot</span><strong>{region.label}</strong></div>
        <nav aria-label="Explorer navigation"><Link href="/">Globe</Link><Link href={`/calendar?region=${filters.region}&year=${filters.start.slice(0, 4)}&sensor=${filters.sensor === "viirs" ? "VIIRS_SNPP" : "MODIS"}&date=${filters.start}`}>Calendar</Link><Link href="/compare">Compare</Link><Link href="/method">Method</Link></nav>
      </header>

      <div className="explorer-layout">
        <aside className="explorer-controls" aria-label="Observation filters">
          <div className="control-heading"><span>01 / analysis extent</span><h1>Choose a place and slice.</h1></div>
          <label><span>Curated region</span><select value={filters.region} onChange={(event) => chooseRegion(event.target.value as RegionId)}><option value="punjab">Punjab, Pakistan</option><option value="california">California, USA</option></select></label>
          <div className="date-pair"><label><span>Start UTC</span><input type="date" min={dataset.period.start} max={filters.end} value={filters.start} onChange={(event) => updateFilter("start", event.target.value)} /></label><label><span>End UTC</span><input type="date" min={filters.start} max={dataset.period.end} value={filters.end} onChange={(event) => updateFilter("end", event.target.value)} /></label></div>
          <label><span>Sensor family</span><select value={filters.sensor} onChange={(event) => updateFilter("sensor", event.target.value as ExplorerFilters["sensor"])}><option value="all">MODIS + VIIRS (separate)</option><option value="modis">MODIS only</option><option value="viirs">VIIRS only</option></select></label>
          <label><span>Satellite platform</span><select value={filters.platform} onChange={(event) => updateFilter("platform", event.target.value)}>{platformOptions.map((option) => <option value={option} key={option}>{option === "all" ? "All available platforms" : option}</option>)}</select></label>
          <fieldset><legend>Record quality</legend><div className="segmented">{[["all", "All"], ["sp", "SP"], ["nrt", "NRT"]].map(([value, label]) => <button key={value} type="button" aria-pressed={filters.quality === value} onClick={() => updateFilter("quality", value as ExplorerFilters["quality"])}>{label}</button>)}</div></fieldset>
          <fieldset><legend>Overpass light</legend><div className="segmented">{[["all", "All"], ["D", "Day"], ["N", "Night"]].map(([value, label]) => <button key={value} type="button" aria-pressed={filters.dayNight === value} onClick={() => updateFilter("dayNight", value as ExplorerFilters["dayNight"])}>{label}</button>)}</div></fieldset>
          <div className="filter-caveat"><strong>Positive detections only</strong><p>A gap is not confirmed no-fire or proof of observation coverage.</p></div>
          <Link className="passport-journey" href={`/passport?region=${filters.region}&year=${filters.start.slice(0, 4)}&sensor=${filters.sensor === "viirs" ? "VIIRS_SNPP" : "MODIS"}&date=${filters.start}`}>Generate Fire Season Passport ↗</Link>
        </aside>

        <section className="map-column" aria-labelledby="map-title">
          <div className="map-summary"><div><span id="map-title">Raw detected pixels matching filters</span><strong>{fullCount.toLocaleString("en")}</strong><small>all source rows in rectangular AOI</small></div><div><span>Rendered rows</span><strong>{observations.length.toLocaleString("en")}</strong><small>deterministic display sample</small></div></div>
          {observations.length ? <RegionalMap key={filters.region} regionKey={filters.region} bounds={region.bounds} initialView={mapView} observations={observations} selected={activeSelected} onSelect={setSelected} onViewChange={handleViewChange} /> : <div className="map-empty" role="status"><span>0 matching source rows</span><strong>No detections match this slice.</strong><p>This does not mean the area was observed and fire-free. Expand the date range or change a sensor/quality filter.</p></div>}
        </section>

        <aside className="explorer-inspector" aria-label="Detection inspection and provenance">
          <div className="control-heading"><span>02 / inspect evidence</span><h2>{activeSelected ? "Selected source row" : "Choose a detection"}</h2></div>
          {activeSelected ? <dl className="observation-detail"><div><dt>Acquired</dt><dd>{activeSelected.acquiredUtc.replace("T", " ")} UTC</dd></div><div><dt>Sensor</dt><dd>{activeSelected.sensor}</dd></div><div><dt>Satellite</dt><dd>{activeSelected.satellite}</dd></div><div><dt>Confidence</dt><dd>{confidenceLabel(activeSelected)}</dd></div><div><dt>FRP</dt><dd>{activeSelected.frpMw == null ? "Not reported" : `${activeSelected.frpMw.toFixed(1)} MW`}</dd></div><div><dt>Record quality</dt><dd>{activeSelected.quality.toUpperCase()}{activeSelected.quality === "nrt" ? " · provisional" : ""}</dd></div><div><dt>Day / night</dt><dd>{activeSelected.dayNight === "D" ? "Day" : "Night"}</dd></div><div><dt>Coordinates</dt><dd>{activeSelected.latitude.toFixed(5)}, {activeSelected.longitude.toFixed(5)}</dd></div></dl> : <p className="inspector-prompt">Zoom to level 8 for points, select a point, or use a recent row below. A detection is not automatically a wildfire.</p>}

          <div className="observation-list"><span>Rows in current display sample</span>{observations.slice(0, 5).map((row) => <button type="button" key={row.id} aria-pressed={activeSelected?.id === row.id} onClick={() => setSelected(row)}><strong>{row.acquiredUtc.slice(0, 10)} · {row.acquiredUtc.slice(11, 16)} UTC</strong><small>{row.sensor} / {row.satellite} / {row.quality.toUpperCase()}</small></button>)}</div>

          <button className="download-action" type="button" onClick={download} disabled={!observations.length}>Download filtered display rows (.csv)</button>
          <details className="provenance-drawer"><summary>Provenance & limits</summary><div><p><strong>{dataset.provenance.producer}</strong><br />Via {dataset.provenance.mirror}</p><p>Source modified {new Date(dataset.provenance.sourceMetadata.last_modified).toISOString().slice(0, 10)} · fetched {dataset.provenance.sourceMetadata.checked_at_utc.slice(0, 10)}</p><p>{dataset.provenance.caveat}</p><p>AOI: {region.aoiKind}. Boundary box verified from {region.boundarySource.name} relation {region.boundarySource.osmId}.</p><a href={dataset.provenance.sourceUrl} target="_blank" rel="noreferrer">Open exact raw Parquet source ↗</a><a href="https://source.coop/portolan-mirrors/firms-catalog" target="_blank" rel="noreferrer">Read mirror catalog ↗</a></div></details>
        </aside>
      </div>
    </main>
  );
}
