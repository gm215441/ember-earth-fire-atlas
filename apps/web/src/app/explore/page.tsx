import { Suspense } from "react";
import { ExploreRouteEntry } from "@/components/route-entries";

export default function ExplorePage() {
  return <Suspense fallback={<main className="state-page" aria-busy="true"><p className="eyebrow">Loading atlas</p><h1>Preparing regional evidence.</h1></main>}><ExploreRouteEntry /></Suspense>;
}
