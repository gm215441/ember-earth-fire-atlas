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
  focus: { lat: number; lng: number } | null;
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
      { lat: focus.lat, lng: focus.lng, altitude: 1.48 },
      reducedMotion ? 0 : 900,
    );
  }, [focus, reducedMotion]);

  return (
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
      onGlobeClick={(coords) => {
        onInteraction();
        onSelect(coords);
      }}
    />
  );
}
