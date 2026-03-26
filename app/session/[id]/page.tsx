import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await (supabase as any)
    .from("sessions")
    .select(`
      *,
      brewery:breweries(name, city, state),
      profile:profiles(display_name, username),
      beer_logs(id, quantity, rating)
    `)
    .eq("id", id)
    .maybeSingle();

  if (!session) {
    return { title: "Session Not Found — HopTrack" };
  }

  const displayName = session.profile?.display_name || session.profile?.username || "Someone";
  const breweryName = session.brewery?.name || "Home";
  const beerCount = (session.beer_logs || []).reduce((sum: number, b: any) => sum + (b.quantity || 1), 0);
  const ratedLogs = (session.beer_logs || []).filter((b: any) => b.rating != null);
  const avgRating = ratedLogs.length > 0
    ? (ratedLogs.reduce((sum: number, b: any) => sum + (b.rating || 0), 0) / ratedLogs.length).toFixed(1)
    : null;

  const title = `${displayName} at ${breweryName} — HopTrack`;
  const description = `${beerCount} beer${beerCount !== 1 ? "s" : ""}${avgRating ? ` · avg ${avgRating}★` : ""} · Tracked on HopTrack`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "HopTrack",
      images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512 }],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function SessionSharePage({ params }: Props) {
  const { id } = await params;

  // Redirect to home feed — the OG tags are what matters for link previews
  redirect(`/home?session=${id}`);
}
