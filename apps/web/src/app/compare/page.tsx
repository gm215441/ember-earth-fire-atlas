import { Suspense } from "react";
import { CompareRouteEntry } from "@/components/route-entries";

export default function ComparePage() {
  return <Suspense fallback={<main className="state-page" aria-busy="true"><p className="eyebrow">Loading comparison</p><h1>Preparing sensor histories.</h1></main>}><CompareRouteEntry /></Suspense>;
}
