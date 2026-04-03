import { createClient } from "@/lib/supabase/server";
import { fetchBreweryList } from "@/lib/superadmin-brewery-list";
import BreweriesListClient from "./BreweriesListClient";

export const metadata = { title: "Breweries" };

export default async function BreweriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const supabase = await createClient();
  const data = await fetchBreweryList(supabase, {
    page: Math.max(1, parseInt(page ?? "1", 10)),
    search: q?.trim() || undefined,
  });
  return <BreweriesListClient initialData={data} initialSearch={q ?? ""} />;
}
