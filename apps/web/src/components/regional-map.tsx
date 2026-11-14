"use client";

import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { ScatterplotLayer } from "@deck.gl/layers";
import { MapLibreOverlay } from "@deck.gl/maplibre";
import { Map, NavigationControl, setWorkerUrl } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";

import { confidenceLabel, type RegionalObservation } from "@/lib/regional-data";

setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());

type ViewState = { longitude: number; latitude: number; zoom: number };

export function RegionalMap({
  regionKey,
  bounds,
  initialView,
  observations,
  selected,
  onSelect,
  onViewChange,
}: {
  regionKey: string;
  bounds: [number, number, number, number];
  initialView: ViewState;
  observations: RegionalObservation[];
  selected: RegionalObservation | null;
  onSelect: (observation: RegionalObservation) => void;
  onViewChange: (view: ViewState) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const overlayRef = useRef<MapLibreOverlay | null>(null);
  const [zoom, setZoom] = useState(initialView.zoom);
  const [loaded, setLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const layers = useMemo(() => {
    if (zoom < 8) {
      return [new HeatmapLayer<RegionalObservation>({
        id: "regional-heatmap",
        data: observations,
        getPosition: (row) => [row.longitude, row.latitude],
        getWeight: 1,
        radiusPixels: zoom < 6 ? 38 : 28,
        intensity: 0.9,
        threshold: 0.04,
        colorRange: [
          [20, 38, 49, 0],
          [54, 80, 90, 95],
          [151, 75, 45, 150],
          [233, 116, 67, 205],
          [244, 163, 110, 245],
          [255, 224, 194, 255],
        ],
      })];
    }

    return [new ScatterplotLayer<RegionalObservation>({
      id: "regional-points",
      data: observations,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 229, 210, 220],
      getPosition: (row) => [row.longitude, row.latitude],
      getRadius: (row) => row.sensor === "MODIS" ? 820 : 520,
      radiusMinPixels: 2.5,
      radiusMaxPixels: 10,
      getFillColor: (row) => row.sensor === "MODIS" ? [244, 163, 110, 210] : [233, 116, 67, 205],
      getLineColor: [255, 229, 210, 180],
      stroked: true,
      lineWidthMinPixels: 0.5,
      onClick: ({ object }) => { if (object) onSelect(object); },
    })];
  }, [observations, onSelect, zoom]);

  useEffect(() => {
    if (!containerRef.current) return;
    let timeout: number | undefined;
    try {
      const map = new Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [initialView.longitude, initialView.latitude],
        zoom: initialView.zoom,
        minZoom: 4,
        maxZoom: 13,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");
      const overlay = new MapLibreOverlay({ interleaved: true, layers: [] });
      overlayRef.current = overlay;
      map.addControl(overlay);
      map.on("load", () => { setLoaded(true); setMapError(null); });
      map.on("zoom", () => setZoom(map.getZoom()));
      map.on("moveend", () => {
        const center = map.getCenter();
        onViewChange({ longitude: center.lng, latitude: center.lat, zoom: map.getZoom() });
      });
      map.on("error", (event) => {
        if (!map.loaded() && event.error) setMapError("The basemap could not be loaded. The detection table remains available below.");
      });
      timeout = window.setTimeout(() => {
        if (!map.loaded()) setMapError("The basemap is taking too long to respond. Check the network and retry.");
      }, 12_000);
      return () => {
        if (timeout) window.clearTimeout(timeout);
        overlayRef.current = null;
        mapRef.current = null;
        map.remove();
      };
    } catch {
      window.setTimeout(() => setMapError("WebGL mapping is unavailable in this browser. The observation table remains usable."), 0);
    }
  }, [initialView.latitude, initialView.longitude, initialView.zoom, onViewChange, regionKey]);

  useEffect(() => {
    overlayRef.current?.setProps({
      layers,
      getTooltip: ({ object }) => {
        const row = object as RegionalObservation | undefined;
        if (!row) return null;
        return {
          text: `${row.acquiredUtc.replace("T", " ")} UTC\n${row.sensor} · ${row.satellite}\nConfidence: ${confidenceLabel(row)}\nFRP: ${row.frpMw == null ? "not reported" : `${row.frpMw.toFixed(1)} MW`}\nQuality: ${row.quality.toUpperCase()} · ${row.dayNight === "D" ? "day" : "night"}`,
        };
      },
    });
  }, [layers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;
    map.easeTo({ center: [selected.longitude, selected.latitude], zoom: Math.max(map.getZoom(), 9), duration: 700 });
  }, [selected]);

  return (
    <div className="regional-map" data-map-loaded={loaded}>
      <div ref={containerRef} className="regional-map-canvas" aria-label="Interactive detection map" />
      {!loaded && !mapError ? <div className="map-loading" role="status"><i />Loading attributed basemap and real detections…</div> : null}
      {mapError ? <div className="map-error" role="alert"><strong>Map unavailable</strong><span>{mapError}</span></div> : null}
      <div className="map-mode" aria-live="polite"><span>{zoom < 8 ? "Aggregated density" : "Drillable detections"}</span><small>{zoom < 8 ? "Zoom to 8+ for individual rows" : "Select a point for source fields"}</small></div>
      <div className="map-aoi" aria-label="Analysis extent">AOI {bounds.map((value) => value.toFixed(2)).join(" · ")}</div>
    </div>
  );
}
