"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="state-page">
      <p className="eyebrow">Atlas unavailable</p>
      <h1>The scientific view could not be rendered.</h1>
      <p>No substitute observations have been inserted.</p>
      <button type="button" className="primary-action" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
