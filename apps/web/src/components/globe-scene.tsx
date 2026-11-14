"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

import type { GlobePoint } from "./globe-canvas";

const GlobeCanvas = dynamic(() => import("./globe-canvas"), {
  ssr: false,
  loading: () => <GlobeFallback label="Loading interactive Earth" />,
});

type Cell = { id: number; lat: number; lng: number; count: number };

type GlobeSceneProps = {
  cells: Cell[];
  period: string;
  selection: { lat: number; lng: number; altitude?: number } | null;
  onSelect: (coords: { lat: number; lng: number }) => void;
  onInteraction: () => void;
};

function supportsWebGlobe() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

function GlobeFallback({ label }: { label: string }) {
  return (
    <div className="globe-fallback" role="img" aria-label={label}>
      <span className="fallback-orbit" />
      <span className="fallback-grid" />
      <span className="fallback-label">2D accessible Earth preview</span>
    </div>
  );
}

export function GlobeScene({
  cells,
  period,
  selection,
  onSelect,
  onInteraction,
}: GlobeSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [webGl, setWebGl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motion.matches);
    const timer = window.setTimeout(() => {
      setWebGl(supportsWebGlobe());
      updateMotion();
    }, 0);
    motion.addEventListener("change", updateMotion);
    return () => {
      window.clearTimeout(timer);
      motion.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({
        width: Math.max(280, Math.round(width)),
        height: Math.max(340, Math.round(height)),
      });
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const points = useMemo<GlobePoint[]>(() => {
    const max = Math.max(...cells.map((cell) => cell.count), 1);
    return cells.slice(0, 1200).map((cell) => {
      const intensity = Math.log1p(cell.count) / Math.log1p(max);
      return {
        ...cell,
        altitude: 0.003 + intensity * 0.017,
        radius: 0.08 + intensity * 0.13,
        color:
          intensity > 0.76
            ? "rgba(255, 189, 118, 0.94)"
            : intensity > 0.5
              ? "rgba(233, 116, 67, 0.82)"
              : "rgba(176, 69, 43, 0.62)",
      };
    });
  }, [cells]);

  return (
    <div
      ref={hostRef}
      className="globe-host"
      data-globe-ready={ready}
      data-period={period}
    >
      {webGl && size ? (
        <GlobeCanvas
          width={size.width}
          height={size.height}
          points={points}
          focus={selection}
          reducedMotion={reducedMotion}
          onSelect={onSelect}
          onInteraction={onInteraction}
          onReady={() => setReady(true)}
        />
      ) : (
        <GlobeFallback
          label={
            webGl === false
              ? `WebGL unavailable. Accessible Earth fallback for ${period}.`
              : "Checking WebGL support"
          }
        />
      )}
      <p className="globe-control-hint">Drag to rotate · wheel or pinch to zoom</p>
    </div>
  );
}
