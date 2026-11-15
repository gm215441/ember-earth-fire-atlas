import { ScienceTour } from "@/components/science-tour";

export const instant = false;
export const metadata = { title: "EMBER - Guided Science Tour" };

export default async function TourPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const value = Array.isArray(query.step) ? query.step[0] : query.step;
  const requested = Number(value);
  const step = Number.isInteger(requested) && requested >= 1 && requested <= 5 ? requested : 1;
  return <ScienceTour initialStep={step - 1} />;
}
