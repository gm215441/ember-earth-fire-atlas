import { Suspense } from "react";
import { TourRouteEntry } from "@/components/route-entries";

export const metadata = { title: "EMBER - Guided Science Tour" };

export default function TourPage() {
  return <Suspense fallback={<main className="state-page" aria-busy="true"><p className="eyebrow">Loading tour</p><h1>Preparing the guided record.</h1></main>}><TourRouteEntry /></Suspense>;
}
