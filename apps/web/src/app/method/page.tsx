import Link from "next/link";

export default function MethodPage() {
  return (
    <main className="foundation-page">
      <Link href="/">← EMBER</Link>
      <p className="eyebrow">Methodology / live contract</p>
      <h1>What a hotspot is — and is not.</h1>
      <p>
        A hotspot is a satellite-detected thermal-anomaly pixel. It is not a
        unique fire, an ignition, or burned area. Missing detections are not
        treated as confirmed no-fire observations.
      </p>
      <section id="sensor-differences">
        <h2>MODIS and VIIRS are not one ruler.</h2>
        <p>
          Their spatial resolution, sensitivity, overpass timing, and confidence
          semantics differ. EMBER keeps raw sensor histories separate unless a
          held-out calibration demonstrates an honest improvement.
        </p>
      </section>
    </main>
  );
}
