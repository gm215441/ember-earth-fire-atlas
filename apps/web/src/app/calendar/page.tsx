import { Suspense } from "react";
import { CalendarRouteEntry } from "@/components/route-entries";

export default function CalendarPage() {
  return <Suspense fallback={<main className="state-page" aria-busy="true"><p className="eyebrow">Loading calendar</p><h1>Preparing the seasonal record.</h1></main>}><CalendarRouteEntry /></Suspense>;
}
