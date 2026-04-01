import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QRTentClient } from "./QRTentClient";

export async function generateMetadata({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("breweries").select("name").eq("id", brewery_id).single();
  return { title: `QR Table Tent — ${(data as any)?.name ?? "Brewery"} — HopTrack` };
}

export default async function QRTentPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .single() as any;
  if (!account) redirect("/brewery-admin");

  const { data: brewery } = await supabase
    .from("breweries").select("name, city, state").eq("id", brewery_id).single() as any;

  return (
    <QRTentClient
      breweryId={brewery_id}
      breweryName={(brewery as any)?.name ?? ""}
      breweryCity={(brewery as any)?.city ?? ""}
      breweryState={(brewery as any)?.state ?? ""}
    />
  );
}
