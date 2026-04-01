import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EmbedMenu } from "@/components/embed/EmbedMenu";
import { EmbedHeightReporter } from "@/components/embed/EmbedHeightReporter";

export const revalidate = 60; // ISR — revalidate every 60 seconds

interface Props {
  params: Promise<{ brewery_id: string }>;
  searchParams: Promise<{
    theme?: string;
    accent?: string;
    layout?: string;
    showRating?: string;
    showPrice?: string;
    showGlass?: string;
    showStyle?: string;
    showEvents?: string;
    showDescription?: string;
  }>;
}

export default async function EmbedMenuPage({ params, searchParams }: Props) {
  const { brewery_id } = await params;
  const sp = await searchParams;

  const theme = sp.theme === "dark" ? "dark" : "cream";
  const accentColor = sp.accent ?? "D4A843";
  const layout = sp.layout === "compact" ? "compact" : "full";
  const showRating = sp.showRating !== "false";
  const showPrice = sp.showPrice !== "false";
  const showGlass = sp.showGlass !== "false";
  const showStyle = sp.showStyle !== "false";
  const showEvents = sp.showEvents !== "false";
  const showDescription = sp.showDescription === "true"; // Off by default

  const supabase = await createClient();

  // Fetch brewery + beers + events in parallel
  const [breweryRes, beersRes, eventsRes] = await Promise.all([
    (supabase as any)
      .from("breweries")
      .select("id, name, city, state, brewery_type, description, cover_image_url")
      .eq("id", brewery_id)
      .maybeSingle(),
    (supabase as any)
      .from("beers")
      .select("id, name, style, abv, ibu, description, is_featured, avg_rating, total_ratings, price_per_pint, glass_type")
      .eq("brewery_id", brewery_id)
      .eq("is_on_tap", true)
      .order("display_order", { ascending: true })
      .order("name"),
    (supabase as any)
      .from("brewery_events")
      .select("id, title, event_date, start_time")
      .eq("brewery_id", brewery_id)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .limit(5),
  ]);

  if (!breweryRes.data) notFound();

  // Fetch pour sizes
  const beerIds = (beersRes.data ?? []).map((b: any) => b.id);
  const pourSizesMap: Record<string, any[]> = {};

  if (beerIds.length > 0) {
    const { data: pourSizes } = await (supabase as any)
      .from("beer_pour_sizes")
      .select("beer_id, label, oz, price, display_order")
      .in("beer_id", beerIds)
      .order("display_order", { ascending: true });

    if (pourSizes) {
      for (const ps of pourSizes) {
        if (!pourSizesMap[ps.beer_id]) pourSizesMap[ps.beer_id] = [];
        pourSizesMap[ps.beer_id].push({ label: ps.label, oz: ps.oz, price: ps.price });
      }
    }
  }

  const beers = (beersRes.data ?? []).map((beer: any) => ({
    ...beer,
    pour_sizes: pourSizesMap[beer.id] ?? [],
  }));

  return (
    <>
      <EmbedMenu
        brewery={breweryRes.data}
        beers={beers}
        events={eventsRes.data ?? []}
        theme={theme}
        accentColor={accentColor}
        layout={layout}
        showRating={showRating}
        showPrice={showPrice}
        showGlass={showGlass}
        showStyle={showStyle}
        showEvents={showEvents}
        showDescription={showDescription}
      />
      <EmbedHeightReporter />
    </>
  );
}
