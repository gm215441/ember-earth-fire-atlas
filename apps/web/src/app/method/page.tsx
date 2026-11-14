import Link from "next/link";

const definitions = [
  ["Detected pixel", "One sensor-reported thermal-anomaly pixel. Not a unique fire, ignition, or burned area."],
  ["Raw count", "Detected pixels for a named sensor, platform, quality class, region, and UTC period."],
  ["FRP", "Fire radiative power reported for a detected pixel in MW. Not hectares, damage, or emissions."],
  ["Coverage", "Whether an observation opportunity was usable. Positive-only detections cannot establish it."],
];

export default function MethodPage() {
  return (
    <main className="method-shell">
      <header className="method-header"><Link className="brand-lockup" href="/"><span className="brand-mark">E</span><span><strong>EMBER</strong><small>Methods & limits</small></span></Link><nav><Link href="/explore">Explore</Link><Link href="/calendar">Calendar</Link><Link href="/compare">Compare</Link></nav></header>
      <section className="method-hero"><p className="eyebrow">Scientific contract / version 1</p><h1>Read the signal.<br />Keep the limits.</h1><p>EMBER makes historical thermal-anomaly detections explorable without turning them into claims the source cannot support.</p></section>

      <nav className="method-index" aria-label="Method sections"><a href="#definitions">Definitions</a><a href="#pipeline">Pipeline</a><a href="#sensor-differences">Sensors</a><a href="#coverage">Coverage</a><a href="#validation">Validation</a><a href="#sources">Sources</a></nav>

      <section className="method-section" id="definitions"><div><span>01</span><h2>What the record contains.</h2></div><div className="definition-grid">{definitions.map(([term, description]) => <article key={term}><h3>{term}</h3><p>{description}</p></article>)}</div></section>

      <section className="method-section" id="pipeline"><div><span>02</span><h2>Exact files. Explicit partitions.</h2></div><div className="method-prose"><p>Historical series read one exact <code>detections/year={'{YYYY}'}/detections.parquet</code> object per year from the independent Portolan mirror of NASA FIRMS. DuckDB Spatial clips rows to disclosed rectangular AOIs and preserves sensor, satellite, SP/NRT quality, UTC time, day/night, native confidence and FRP.</p><p>The pipeline never uses <code>year=*/*.parquet</code>. Exact duplicate identities are counted before removal; nearby or repeated observations remain because they are not duplicate fires.</p><pre><code>pipeline/.venv/Scripts/python.exe pipeline/build_regional_series.py --start-year 2000 --end-year 2025</code></pre><Link href="https://source.coop/portolan-mirrors/firms-catalog" target="_blank">Open mirror catalog ↗</Link></div></section>

      <section className="method-section" id="sensor-differences"><div><span>03</span><h2>MODIS and VIIRS are not one ruler.</h2></div><div className="sensor-method-grid"><article><span>MODIS</span><h3>Numeric confidence</h3><p>Terra and Aqua remain named platforms. The long reference stream uses SP records and a 2003–2024 calendar-month baseline.</p></article><b aria-hidden="true">≠</b><article><span>VIIRS SNPP</span><h3>Categorical confidence</h3><p>Low, nominal, and high stay categorical. The separate Suomi-NPP reference uses SP records and a 2013–2024 baseline.</p></article><p>NOAA-20 and NOAA-21 remain independent streams. Raw panels use independent vertical scales. Reference index 100 means that sensor&apos;s own calendar-month median; it is not harmonization.</p></div></section>

      <section className="method-section" id="coverage"><div><span>04</span><h2>An empty record is not a clear sky.</h2></div><div className="method-prose"><p>The detection tables are positive-only. Zero matching rows cannot distinguish observed no-fire from cloud, smoke, orbit gaps, unavailable partitions, or other missing observation opportunities.</p><div className="method-rule"><strong>EMBER never converts missing observations into confirmed zero fire.</strong><span>A coverage claim would require a compatible observation-quality or fire-mask product.</span></div><p>Punjab and California are rectangular analysis extents verified against OpenStreetMap relations, not polygon clips. Dates stay UTC.</p></div></section>

      <section className="method-section" id="validation"><div><span>05</span><h2>No calibration is accepted yet.</h2></div><div className="method-prose"><p>The current outputs are separate raw histories and within-sensor seasonal references. They are descriptive, not causal, predictive, or calibrated cross-sensor truth.</p><p>A combined index can be promoted only after leakage-safe held-out evaluation improves an explicit baseline on unseen years and regions. Until then, the application shows independent histories.</p><Link href="/compare">Inspect separate sensor histories ↗</Link></div></section>

      <section className="method-section" id="sources"><div><span>06</span><h2>Provenance you can follow.</h2></div><div className="source-list"><a href="https://firms.modaps.eosdis.nasa.gov/download/" target="_blank"><strong>NASA FIRMS archive</strong><span>Authoritative producer ↗</span></a><a href="https://firms.modaps.eosdis.nasa.gov/api/area/" target="_blank"><strong>NASA FIRMS Area API</strong><span>Recent area access ↗</span></a><a href="https://source.coop/portolan-mirrors/firms-catalog" target="_blank"><strong>Portolan FIRMS catalog</strong><span>Independent historical mirror ↗</span></a><a href="https://disasters.nasa.gov/sites/default/files/2023-03/D1P5_FireDetection_Final.pdf" target="_blank"><strong>NASA ARSET fire detection</strong><span>Instrument reference ↗</span></a></div></section>

      <footer className="method-footer"><p>For complete processing assumptions, see the repository documents <code>docs/METHOD.md</code> and <code>docs/LIMITATIONS.md</code>.</p><Link href="/">Return to Earth view ↑</Link></footer>
    </main>
  );
}
