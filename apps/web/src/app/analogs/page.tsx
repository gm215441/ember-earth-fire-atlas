import { Suspense } from "react";
import { AnalogsRouteEntry } from "@/components/route-entries";

export const metadata = { title: "EMBER - Seasonal Analogs" };

export default function AnalogsPage() {
  return <Suspense fallback={<main className="state-page" aria-busy="true"><p className="eyebrow">Loading analogs</p><h1>Preparing seasonal profiles.</h1></main>}><AnalogsRouteEntry /></Suspense>;
}
