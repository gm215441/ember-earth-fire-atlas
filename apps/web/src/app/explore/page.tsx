import Link from "next/link";

export const instant = false;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const region = query.region === "california" ? "California" : "Punjab";

  return (
    <main className="foundation-page">
      <Link href="/">← EMBER</Link>
      <p className="eyebrow">Regional explorer / foundation checkpoint</p>
      <h1>{region}</h1>
      <p>
        The selected region is preserved in the URL. Its science-quality
        detection snapshot and map arrive in Phase 05; no placeholder counts are
        shown here.
      </p>
    </main>
  );
}
