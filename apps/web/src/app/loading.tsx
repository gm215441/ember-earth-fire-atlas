export default function Loading() {
  return (
    <main className="state-page" aria-live="polite" aria-busy="true">
      <p className="eyebrow">Loading atlas</p>
      <h1>Preparing the Earth record.</h1>
      <div className="loading-rule" aria-hidden="true" />
    </main>
  );
}
