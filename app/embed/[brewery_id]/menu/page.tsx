import { notFound } from "next/navigation";
import { EmbedMenu } from "@/components/embed/EmbedMenu";
import { EmbedHeightReporter } from "@/components/embed/EmbedHeightReporter";
import { getCachedEmbedMenuData } from "@/lib/cached-data";

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

  const { brewery, beers, events } = await getCachedEmbedMenuData(brewery_id);

  if (!brewery) notFound();

  return (
    <>
      <EmbedMenu
        brewery={brewery}
        beers={beers}
        events={events}
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
