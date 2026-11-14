"use client";

import { useEffect, useRef } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";

export type GlobePoint = {
  id: number;
  lat: number;
  lng: number;
  count: number;
  altitude: number;
  radius: number;
  color: string;
};

type GlobeCanvasProps = {
  width: number;
  height: number;
  points: GlobePoint[];
  focus: { lat: number; lng: number; altitude?: number } | null;
  reducedMotion: boolean;
  onSelect: (coords: { lat: number; lng: number }) => void;
  onInteraction: () => void;
  onReady: () => void;
};

export default function GlobeCanvas({
  width,
  height,
  points,
  focus,
  reducedMotion,
  onSelect,
  onInteraction,
  onReady,
}: GlobeCanvasProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const interactionRef = useRef(onInteraction);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    interactionRef.current = onInteraction;
  }, [onInteraction]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.34;
    controls.minDistance = 132;
    controls.maxDistance = 360;

    const stopAutoRotation = () => {
      controls.autoRotate = false;
      interactionRef.current();
    };

    controls.addEventListener("start", stopAutoRotation);
    globe.pointOfView({ lat: 18, lng: 32, altitude: 1.82 }, 0);

    return () => controls.removeEventListener("start", stopAutoRotation);
  }, [reducedMotion]);

  useEffect(() => {
    if (!focus || !globeRef.current) return;
    globeRef.current.controls().autoRotate = false;
    globeRef.current.pointOfView(
      { lat: focus.lat, lng: focus.lng, altitude: focus.altitude ?? 1.48 },
      reducedMotion ? 0 : 900,
    );
  }, [focus, reducedMotion]);

  return (
    <div
      className="globe-canvas-shell"
      style={{ width, height }}
      onPointerDown={(event) => {
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const start = pointerStartRef.current;
        pointerStartRef.current = null;
        if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) {
          return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();
        const coords = globeRef.current?.toGlobeCoords(
          event.clientX - bounds.left,
          event.clientY - bounds.top,
        );
        if (!coords) return;
        onInteraction();
        onSelect(coords);
      }}
    >
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="/images/bluemarble-2048.png"
        showAtmosphere
        atmosphereColor="#6f9ca9"
        atmosphereAltitude={0.11}
        showGraticules={false}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude="altitude"
        pointRadius="radius"
        pointResolution={5}
        pointsMerge
        pointsTransitionDuration={reducedMotion ? 0 : 650}
        onGlobeReady={onReady}
      />
    </div>
  );
}
