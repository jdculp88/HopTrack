import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PassportGrid } from "./PassportGrid";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return { title: `${username}'s Beer Passport` };
}

export default async function PassportPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  // Fetch all beer logs with beer + brewery joins
  const { data: beerLogs } = await supabase
    .from("beer_logs")
    .select("beer_id, rating, logged_at, quantity, beer:beers(id, name, style, abv, brewery_id, brewery:breweries(id, name))")
    .eq("user_id", profile.id)
    .not("beer_id", "is", null)
    .order("logged_at", { ascending: true });

  // Deduplicate by beer_id — keep first occurrence (first time tried)
  const seen = new Set<string>();
  const stamps = ((beerLogs as any[]) ?? [])
    .filter((log: any) => {
      if (!log.beer_id || seen.has(log.beer_id)) return false;
      seen.add(log.beer_id);
      return true;
    })
    .map((log: any) => ({
      beerId: log.beer_id,
      beerName: log.beer?.name ?? "Unknown Beer",
      style: log.beer?.style ?? null,
      abv: log.beer?.abv ?? null,
      breweryName: log.beer?.brewery?.name ?? "Unknown Brewery",
      breweryId: log.beer?.brewery?.id ?? null,
      rating: log.rating,
      firstTriedAt: log.logged_at,
    }));

  // Compute stats
  const uniqueStyles = new Set(stamps.map((s: any) => s.style).filter(Boolean));
  const uniqueBreweries = new Set(stamps.map((s: any) => s.breweryName));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Link
        href={`/profile/${username}`}
        className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors"
      >
        <ArrowLeft size={14} />
        {(profile as any).display_name ?? username}
      </Link>

      <PassportGrid
        stamps={stamps}
        totalBeers={stamps.length}
        totalStyles={uniqueStyles.size}
        totalBreweries={uniqueBreweries.size}
      />
    </div>
  );
}
