import { Suspense } from "react";
import { PassportRouteEntry } from "@/components/route-entries";

export const metadata = { title: "EMBER - Fire Season Passport" };

export default function PassportPage() {
  return <Suspense fallback={<main className="state-page" aria-busy="true"><p className="eyebrow">Loading passport</p><h1>Preparing the evidence sheet.</h1></main>}><PassportRouteEntry /></Suspense>;
}
