const readiness = [
  ["Runtime", "Next.js 16 / React 19"],
  ["Science", "Guardrails active"],
  ["Data", "Real-source proof next"],
] as const;

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050911] text-[#F2F3F0]">
      <div className="ember-haze" aria-hidden="true" />
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#A8B4C0]">
          <span>EMBER / Earth Fire Atlas</span>
          <span className="text-[#E97443]">Phase 00</span>
        </header>

        <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[minmax(0,0.82fr)_minmax(360px,0.7fr)] lg:py-20">
          <div className="relative z-10 max-w-[720px]">
            <p className="mb-7 font-mono text-xs uppercase tracking-[0.2em] text-[#E97443]">
              Twenty-five years of Earth&apos;s fire record
            </p>
            <h1 className="max-w-[11ch] text-[clamp(3.4rem,7vw,7.4rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
              Every place has a history of burning.
            </h1>
            <p className="mt-8 max-w-[58ch] text-base leading-7 text-[#A8B4C0] sm:text-lg">
              EMBER is being built as a sensor-aware atlas of satellite-detected
              thermal anomalies. The application shell and science constraints
              are ready; real-data validation begins in the next milestone.
            </p>
            <a
              className="mt-10 inline-flex min-h-12 items-center border border-[#E97443]/70 px-5 font-mono text-xs uppercase tracking-[0.16em] text-[#F4A36E] transition-colors hover:bg-[#E97443]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F4A36E]"
              href="#preflight-status"
            >
              Inspect preflight status
            </a>
          </div>

          <div className="relative flex min-h-[360px] items-center justify-center lg:min-h-[560px]">
            <div className="planet-shell" aria-hidden="true">
              <div className="planet-grid" />
              <div className="planet-terminator" />
            </div>
            <p className="absolute bottom-3 max-w-[34ch] text-center font-mono text-[10px] uppercase leading-5 tracking-[0.16em] text-[#6D7C8D]">
              Visual shell only — no scientific observations are rendered in
              preflight
            </p>
          </div>
        </section>

        <section
          id="preflight-status"
          aria-labelledby="preflight-heading"
          className="border-t border-white/10 py-7"
        >
          <div className="grid gap-6 md:grid-cols-[1.2fr_2fr] md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6D7C8D]">
                Build checkpoint
              </p>
              <h2 id="preflight-heading" className="mt-2 text-2xl tracking-tight">
                Foundation before findings.
              </h2>
            </div>
            <dl className="grid gap-4 sm:grid-cols-3">
              {readiness.map(([term, value]) => (
                <div key={term} className="border-l border-white/10 pl-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6D7C8D]">
                    {term}
                  </dt>
                  <dd className="mt-2 text-sm text-[#A8B4C0]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}
