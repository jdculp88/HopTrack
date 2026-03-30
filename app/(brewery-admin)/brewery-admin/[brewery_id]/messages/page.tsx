import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessagesClient } from "./MessagesClient";

export const metadata = { title: "Messages" };

interface CustomerRow {
  user_id: string;
  display_name: string;
  visits: number;
}

export default async function MessagesPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts").select("role")
    .eq("user_id", user.id).eq("brewery_id", brewery_id).single() as any;
  if (!account) redirect("/brewery-admin");

  // Fetch brewery name
  const { data: brewery } = await supabase
    .from("breweries").select("name")
    .eq("id", brewery_id).single() as any;

  // Fetch all completed sessions for this brewery to build customer tiers
  const { data: sessions } = await supabase
    .from("sessions")
    .select("user_id, profile:profiles!user_id(display_name)")
    .eq("brewery_id", brewery_id)
    .eq("is_active", false) as any;

  // Aggregate per user
  const userMap = new Map<string, { user_id: string; display_name: string; visits: number }>();

  for (const s of (sessions ?? []) as any[]) {
    const uid = s.user_id;
    const profile = s.profile;
    if (!uid || !profile) continue;

    const existing = userMap.get(uid);
    if (existing) {
      existing.visits += 1;
    } else {
      userMap.set(uid, {
        user_id: uid,
        display_name: profile.display_name ?? "Unknown",
        visits: 1,
      });
    }
  }

  const customers: CustomerRow[] = Array.from(userMap.values());

  return (
    <MessagesClient
      breweryId={brewery_id}
      breweryName={brewery?.name ?? "Your Brewery"}
      customers={customers}
    />
  );
}
